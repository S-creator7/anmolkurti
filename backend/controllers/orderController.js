import dotenv from 'dotenv';
dotenv.config();

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import crypto from 'crypto';
import shortid from "shortid";
import tempOrderModel from "../models/tempOrderModel.js"
import productModel from "../models/productModel.js";
import couponModel from "../models/couponModel.js";


// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_SECRET_KEY || '',
})

// Placing orders using COD Method
export const placeOrder = async (req, res) => {
    try {
        const { items, address, amount, couponCode, isGuest, guestInfo } = req.body;
        
        // Handle both guest and authenticated users
        let userId = null;
        if (!isGuest && req.user) {
            userId = req.user.userId;
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in cart' });
        }

        // Validate guest checkout requirements
        if (isGuest && (!guestInfo || !guestInfo.email || !guestInfo.phone || !guestInfo.name)) {
            return res.status(400).json({ 
                success: false, 
                message: "Guest information (name, email, phone) is required for guest checkout" 
            });
        }

        // ✅ Add stock validation before placing order
        const stockValidation = await validateStockAvailability(items);
        if (!stockValidation.success) {
            return res.status(400).json({ success: false, message: stockValidation.message });
        }

        // Calculate total amount (recalculate for security)
        let totalAmount = 0;
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (product) {
                totalAmount += product.price * item.quantity;
            }
        }

        // Add delivery charge
        totalAmount += deliveryCharge;

        // Apply coupon if provided
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await couponModel.findOne({ 
                code: couponCode, 
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });
            
            if (coupon) {
                // Check minimum order amount
                if (totalAmount < coupon.minimumOrderAmount) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon` 
                    });
                }
                
                // Check usage limit
                if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Coupon usage limit exceeded' 
                    });
                }
                
                // Calculate discount
                if (coupon.discountType === 'percentage') {
                    discountAmount = (totalAmount * coupon.discountValue) / 100;
                    // Apply maximum discount limit
                    if (coupon.maximumDiscountAmount) {
                        discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
                    }
                } else {
                    discountAmount = coupon.discountValue;
                }
                
                totalAmount -= discountAmount;
                
                // Update coupon usage count
                await couponModel.findByIdAndUpdate(coupon._id, {
                    $inc: { usedCount: 1 }
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid or expired coupon code' 
                });
            }
        }

        // Create order data
        const orderData = {
            items,
            address,
            amount: totalAmount,
            discountAmount,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now(),
            couponCode: couponCode || null,
            isGuest: isGuest || false
        };

        // Add user or guest info
        if (isGuest) {
            orderData.guestInfo = guestInfo;
            orderData.orderType = 'guest';
        } else {
            orderData.userId = userId;
            orderData.orderType = 'regular';
        }

        // Create order
        const order = new orderModel(orderData);
        await order.save();

        // Update stock
        await updateStock(items);

        // Update user stats if not guest
        if (!isGuest && userId) {
            await userModel.findByIdAndUpdate(userId, {
                $inc: {
                    'stats.totalOrders': 1,
                    'stats.totalSpent': totalAmount
                }
            });
        }

        res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {

        const { userId, items, amount, address, isGuest, guestInfo } = req.body
        const { origin } = req.headers;

        // Validate required fields based on user type
        if (!isGuest && !userId) {
            return res.status(400).json({ success: false, message: "User ID is required for registered users" });
        }

        if (isGuest && (!guestInfo || !guestInfo.email || !guestInfo.phone || !guestInfo.name)) {
            return res.status(400).json({ success: false, message: "Guest information (name, email, phone) is required for guest checkout" });
        }

        // ✅ Add stock validation before creating Stripe order
        const stockValidation = await validateStockAvailability(items);
        if (!stockValidation.success) {
            return res.status(400).json({ success: false, message: stockValidation.message });
        }

        // Create order data based on user type
        const orderData = {
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
            isGuest: isGuest || false
        };

        if (isGuest) {
            orderData.guestInfo = guestInfo;
            orderData.orderType = 'guest';
        } else {
            orderData.userId = userId;
            orderData.orderType = 'regular';
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Verify Stripe 
const verifyStripe = async (req, res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.json({ success: false, message: "Order not found" });
            }

            // ✅ Re-validate stock at payment verification time
            const stockValidation = await validateStockAvailability(order.items);
            if (!stockValidation.success) {
                return res.status(400).json({ success: false, message: `Payment successful but order cannot be completed: ${stockValidation.message}` });
            }

            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            
            // Clear cart only for registered users (guests don't have persistent carts)
            if (!order.isGuest && userId) {
                await userModel.findByIdAndUpdate(userId, { cartData: {} })
            }
            
            await updateStock(order.items); // Deduct stock
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Placing orders using Razorpay Method
// const placeOrderRazorpay = async (req,res) => {
//     try {

//         const { userId, items, amount, address} = req.body

//         const orderData = {
//             userId,
//             items,
//             address,
//             amount,
//             paymentMethod:"Razorpay",
//             payment:false,
//             date: Date.now()
//         }

//         const newOrder = new orderModel(orderData)
//         await newOrder.save()

//         const options = {
//             amount: amount * 100,
//             currency: currency.toUpperCase(),
//             receipt : newOrder._id.toString()
//         }

//         await razorpayInstance.orders.create(options, (error,order)=>{
//             if (error) {
//                 console.log(error)
//                 return res.json({success:false, message: error})
//             }
//             res.json({success:true,order})
//         })

//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:error.message})
//     }
// }


const placeOrderRazorpay = async (req, res) => {
    try {
        const payment_capture = 1;
        const { userId, items, amount, address, isGuest, guestInfo } = req.body;

        // Validate required fields based on user type
        if (!isGuest && !userId) {
            return res.status(400).json({ success: false, message: "User ID is required for registered users" });
        }

        if (isGuest && (!guestInfo || !guestInfo.email || !guestInfo.phone || !guestInfo.name)) {
            return res.status(400).json({ success: false, message: "Guest information (name, email, phone) is required for guest checkout" });
        }

        // ✅ Add stock validation before creating Razorpay order
        const stockValidation = await validateStockAvailability(items);
        if (!stockValidation.success) {
            return res.status(400).json({ success: false, message: stockValidation.message });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: shortid.generate(),
            payment_capture,
            notes: {
                userId: userId || 'guest',
                isGuest: isGuest || false,
                guestEmail: isGuest ? guestInfo.email : null,
                address: JSON.stringify(address), // Keep notes simple
            },
        };

        // Wrap Razorpay order creation in a promise
        const order = await new Promise((resolve, reject) => {
            razorpayInstance.orders.create(options, (error, order) => {
                if (error) return reject(error);
                resolve(order);
            });
        });

        // Store temporary order details in DB
        const tempOrderData = {
            razorpayOrderId: order.id,
            items,
            address,
            amount,
            isGuest: isGuest || false
        };

        if (isGuest) {
            tempOrderData.guestInfo = guestInfo;
        } else {
            tempOrderData.userId = userId;
        }

        await tempOrderModel.create(tempOrderData);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
            },
        });

    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



const verifyRazorpay = async (req, res) => {
    try {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const secretKey = razorpayInstance.key_secret

        if (!secretKey) {
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const hmac = crypto.createHmac("sha256", razorpayInstance.key_secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Signature verification failed" });
        }

        // ✅ Fetch original order data from tempOrderModel
        const orderMeta = await tempOrderModel.findOne({ razorpayOrderId: razorpay_order_id });

        if (!orderMeta) {
            return res.status(404).json({ success: false, message: "Order metadata not found" });
        }

        const { userId, items, address, amount, isGuest, guestInfo } = orderMeta;

        // ✅ Re-validate stock at payment verification time
        const stockValidation = await validateStockAvailability(items);
        if (!stockValidation.success) {
            return res.status(400).json({ success: false, message: `Payment successful but order cannot be completed: ${stockValidation.message}` });
        }

        // Create order data based on user type
        const orderData = {
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: true,
            date: Date.now(),
            isGuest: isGuest || false
        };

        if (isGuest) {
            orderData.guestInfo = guestInfo;
            orderData.orderType = 'guest';
        } else {
            orderData.userId = userId;
            orderData.orderType = 'regular';
        }

        await orderModel.create(orderData);

        // Clear cart only for registered users (guests don't have persistent carts)
        if (!isGuest && userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }
        
        await updateStock(orderMeta.items); // Deduct stock

        // Clean up temp order
        await tempOrderModel.deleteOne({ razorpayOrderId: razorpay_order_id });

        res.json({ success: true, message: "Payment Successful" });

    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// const verifyRazorpay = async (req,res) => {
//     try {

//         const { userId, razorpay_order_id  } = req.body

//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
//         if (orderInfo.status === 'paid') {
//             await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
//             await userModel.findByIdAndUpdate(userId,{cartData:{}})
//             res.json({ success: true, message: "Payment Successful" })
//         } else {
//              res.json({ success: false, message: 'Payment Failed' });
//         }

//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:error.message})
//     }
// }


const listOrdersPaginated = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await orderModel.countDocuments();

    const orders = await orderModel.find({})
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Transform orders to include customer info for display
    const transformedOrders = orders.map(order => {
      const orderObj = order.toObject();

      if (order.isGuest) {
        orderObj.customerInfo = {
          name: order.guestInfo.name,
          email: order.guestInfo.email,
          phone: order.guestInfo.phone,
          type: 'Guest'
        };
      } else {
        orderObj.customerInfo = {
          userId: order.userId,
          type: 'Registered'
        };
      }

      return orderObj;
    });

    res.json({
      success: true,
      orders: transformedOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {

        const userId = req.user.userId // Get userId from authenticated token

        const orders = await orderModel.find({ userId, isGuest: false })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Guest Order Tracking - New function for guests to track orders
export const guestOrderTracking = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.json({ success: false, message: "Email or phone number is required" });
        }

        const query = { 
            isGuest: true,
            $or: []
        };

        if (email) {
            query.$or.push({ 'guestInfo.email': email });
        }
        
        if (phone) {
            query.$or.push({ 'guestInfo.phone': phone });
        }

        const orders = await orderModel.find(query).sort({ date: -1 });
        
        res.json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {

        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Helper function to update stock
async function updateStock(items) {
    for (const item of items) {
        const product = await productModel.findById(item._id);
        if (!product) {
            console.log(`Product not found for ID: ${item._id}`);
            continue;
        }

        if (product.hasSize) {
            const size = item.size;
            const quantity = item.quantity || 0;
            const currentStock = product.stock?.[size] || 0;
            
            // ✅ More robust stock update with proper object handling
            if (!product.stock) product.stock = {};
            product.stock[size] = Math.max(0, currentStock - quantity);
            product.markModified('stock'); // Ensure Mongoose saves the change
        } else {
            const quantity = item.quantity || 0;
            const currentStock = typeof product.stock === 'number' ? product.stock : 0;
            product.stock = Math.max(0, currentStock - quantity);
        }

        await product.save();
        console.log(`Stock updated for product ${product.name}: ${item.quantity} units deducted`);
    }
}

// New helper function to validate stock availability before placing order
async function validateStockAvailability(items) {
    for (const item of items) {
        const product = await productModel.findById(item._id);
        if (!product) {
            return { success: false, message: `Product with id ${item._id} not found` };
        }

        if (product.hasSize) {
            const size = item.size;
            const quantity = item.quantity || 0;
            const currentStock = product.stock?.[size] || 0;
            
            // Industry standard: Allow slight overselling but block major issues
            if (currentStock <= 0) {
                return { success: false, message: `${product.name} (Size: ${size}) is out of stock` };
            }
            // Only block if trying to order more than 2x available stock (protects against massive overselling)
            if (quantity > currentStock * 2) {
                return { success: false, message: `Cannot fulfill order: requesting ${quantity} of ${product.name} (Size: ${size}), but only ${currentStock} available` };
            }
        } else {
            const quantity = item.quantity || 0;
            const currentStock = typeof product.stock === 'number' ? product.stock : 0;
            
            // Industry standard: Allow slight overselling but block major issues  
            if (currentStock <= 0) {
                return { success: false, message: `${product.name} is out of stock` };
            }
            // Only block if trying to order more than 2x available stock (protects against massive overselling)
            if (quantity > currentStock * 2) {
                return { success: false, message: `Cannot fulfill order: requesting ${quantity} of ${product.name}, but only ${currentStock} available` };
            }
        }
    }
    return { success: true };
}

import mongoose from 'mongoose';

const getBestsellers = async (req, res) => {
  try {
    // Aggregate order items to count total quantity sold per product
    const bestsellers = await orderModel.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.id",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          productName: "$product.name",
          category: "$product.category",
          price: "$product.price",
          image: "$product.image"  // Return the full image array
        }
      }
    ]);
    res.json({ success: true, bestsellers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard metrics
export const getDashboardMetrics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);

        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);

        const monthStart = new Date(today);
        monthStart.setDate(1);

        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(monthStart.getMonth() - 1);

        // Enhanced revenue metrics with growth calculations
        const [
            totalRevenue, 
            todayRevenue, 
            yesterdayRevenue,
            weeklyRevenue, 
            lastWeekRevenue,
            monthlyRevenue,
            lastMonthRevenue,
            dailyRevenueLast7Days,
            monthlyRevenueLast6Months
        ] = await Promise.all([
            // Total revenue
            orderModel.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Today's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: today.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Yesterday's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: yesterday.getTime(), $lt: today.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // This week's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: weekStart.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last week's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: lastWeekStart.getTime(), $lt: weekStart.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // This month's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: monthStart.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last month's revenue
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: lastMonthStart.getTime(), $lt: monthStart.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Daily revenue for last 7 days
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: weekStart.getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]),
            // Monthly revenue for last 6 months
            orderModel.aggregate([
                { $match: { 
                    date: { $gte: new Date(today.getFullYear(), today.getMonth() - 6, 1).getTime() },
                    status: { $ne: 'cancelled' }
                } },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ])
        ]);

        // Calculate growth rates
        const todayRev = todayRevenue[0]?.total || 0;
        const yesterdayRev = yesterdayRevenue[0]?.total || 0;
        const weekRev = weeklyRevenue[0]?.total || 0;
        const lastWeekRev = lastWeekRevenue[0]?.total || 0;
        const monthRev = monthlyRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;

        const dailyGrowth = yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev) * 100 : 0;
        const weeklyGrowth = lastWeekRev > 0 ? ((weekRev - lastWeekRev) / lastWeekRev) * 100 : 0;
        const monthlyGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

        // Get order metrics with revenue breakdown
        const orderMetrics = await orderModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);

        // Get customer metrics
        const [totalCustomers, newCustomers, lastWeekCustomers] = await Promise.all([
            userModel.countDocuments({}),
            userModel.countDocuments({
                createdAt: { $gte: weekStart }
            }),
            userModel.countDocuments({
                createdAt: { $gte: lastWeekStart, $lt: weekStart }
            })
        ]);

        const returningCustomers = await orderModel.aggregate([
            { $match: { date: { $gte: monthStart.getTime() } } },
            { $group: { _id: '$userId' } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        // Get product metrics
        const [totalProducts, outOfStock, lowStock] = await Promise.all([
            productModel.countDocuments({}),
            productModel.countDocuments({ 
                $or: [
                    { hasSize: false, stock: 0 },
                    { hasSize: true, stock: { $size: 0 } }
                ]
            }),
            productModel.countDocuments({
                $or: [
                    { hasSize: false, stock: { $gt: 0, $lte: 5 } },
                    { hasSize: true, stock: { $elemMatch: { $gt: 0, $lte: 5 } } }
                ]
            })
        ]);

        // Get recent orders
        const recentOrders = await orderModel.find({})
            .sort({ date: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Get top performing categories
        const topCategories = await orderModel.aggregate([
            { $unwind: "$items" },
            { $lookup: {
                from: "products",
                localField: "items._id",
                foreignField: "_id",
                as: "product"
            }},
            { $unwind: "$product" },
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: {
                _id: "$product.category",
                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                orders: { $sum: 1 }
            }},
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // Format metrics
        const metrics = {
            revenue: {
                total: totalRevenue[0]?.total || 0,
                today: todayRev,
                yesterday: yesterdayRev,
                weekly: weekRev,
                lastWeek: lastWeekRev,
                monthly: monthRev,
                lastMonth: lastMonthRev,
                growth: {
                    daily: dailyGrowth,
                    weekly: weeklyGrowth,
                    monthly: monthlyGrowth
                },
                trends: {
                    daily: dailyRevenueLast7Days,
                    monthly: monthlyRevenueLast6Months
                }
            },
            orders: {
                total: orderMetrics.reduce((acc, curr) => acc + curr.count, 0),
                pending: orderMetrics.find(o => o._id === 'pending')?.count || 0,
                processing: orderMetrics.find(o => o._id === 'processing')?.count || 0,
                delivered: orderMetrics.find(o => o._id === 'delivered')?.count || 0,
                cancelled: orderMetrics.find(o => o._id === 'cancelled')?.count || 0,
                revenueByStatus: orderMetrics.reduce((acc, curr) => {
                    acc[curr._id] = curr.revenue;
                    return acc;
                }, {})
            },
            customers: {
                total: totalCustomers,
                new: newCustomers,
                lastWeek: lastWeekCustomers,
                returning: returningCustomers[0]?.count || 0,
                growth: lastWeekCustomers > 0 ? ((newCustomers - lastWeekCustomers) / lastWeekCustomers) * 100 : 0
            },
            products: {
                total: totalProducts,
                outOfStock,
                lowStock
            },
            analytics: {
                topCategories,
                averageOrderValue: orderMetrics.reduce((acc, curr) => acc + curr.revenue, 0) / 
                    orderMetrics.reduce((acc, curr) => acc + curr.count, 0) || 0
            }
        };

        res.json({
            success: true,
            metrics,
            recentOrders
        });

    } catch (error) {
        console.error('Get dashboard metrics error:', error);
        res.json({ success: false, message: 'Failed to fetch dashboard metrics' });
    }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .sort({ date: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Transform the orders to match frontend expectations
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order._id.toString().slice(-8).toUpperCase(), // Generate order number from ID
            totalAmount: order.amount, // Use 'amount' field from order
            createdAt: order.date, // Use 'date' field for createdAt
            status: order.status || 'Order Placed',
            items: order.items || [],
            customer: order.userId ? {
                name: order.userId.name,
                email: order.userId.email
            } : order.guestInfo ? {
                name: order.guestInfo.name,
                email: order.guestInfo.email
            } : null
        }));

        res.json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.json({ success: false, message: 'Failed to fetch recent orders' });
    }
};

export { verifyRazorpay, verifyStripe, placeOrderStripe, placeOrderRazorpay, listOrdersPaginated, userOrders, updateStatus, getBestsellers }
