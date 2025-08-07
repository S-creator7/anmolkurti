import dotenv from 'dotenv';
dotenv.config();

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import tempOrderModel from "../models/tempOrderModel.js"
import productModel from "../models/productModel.js";
import couponModel from "../models/couponModel.js";

import https from 'https';
import querystring from 'querystring';
import PaytmChecksum from "paytmchecksum";
import axios from "axios";

// global variables
const currency = 'inr';
const deliveryCharge = 10;



// Placing orders using COD Method
export const placeOrder = async (req, res) => {
    try {
        const { items, address, amount, couponCode, isGuest, guestInfo, utrNumber } = req.body;

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
            isGuest: isGuest || false,
            utrNumber: utrNumber || null
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


const getBestsellers = async (req, res) => {
    try {
        // Aggregate order items to count total quantity sold per product
        const bestsellers = await orderModel.aggregate([
            { $unwind: "$items" },
            {
                $group: {
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
                {
                    $match: {
                        date: { $gte: today.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Yesterday's revenue
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: yesterday.getTime(), $lt: today.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // This week's revenue
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: weekStart.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last week's revenue
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: lastWeekStart.getTime(), $lt: weekStart.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // This month's revenue
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: monthStart.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Last month's revenue
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: lastMonthStart.getTime(), $lt: monthStart.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Daily revenue for last 7 days
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: weekStart.getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
                        revenue: { $sum: '$amount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            // Monthly revenue for last 6 months
            orderModel.aggregate([
                {
                    $match: {
                        date: { $gte: new Date(today.getFullYear(), today.getMonth() - 6, 1).getTime() },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                        revenue: { $sum: '$amount' },
                        orders: { $sum: 1 }
                    }
                },
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
            {
                $lookup: {
                    from: "products",
                    localField: "items._id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: "$product.category",
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    orders: { $sum: 1 }
                }
            },
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

// controllers/orderController.js

const sabpaisaPaymentCallback = async (req, res) => {
    try {
        const paymentData = req.body;

        console.log('SabPaisa Payment Callback:', paymentData);

        // TODO: Validate SabPaisa signature (if provided)
        const { txnStatus, clientTxnId } = paymentData;

        // You can update order status in DB based on txnStatus and clientTxnId
        // For example:
        // await OrderModel.updateOne({ clientTxnId }, { paymentStatus: txnStatus });

        res.status(200).json({ success: true, message: 'Callback received' });
    } catch (error) {
        console.error('SabPaisa callback error:', error);
        res.status(500).json({ success: false, message: 'Server error during callback' });
    }
};

export const paytmInitiatePayment = async (req, res) => {
    try {
        const { amount, orderId, customerId, mobileNo, emailId } = req.body;
        console.log("Paytm init", req.body)

        const paytmParams = {
            MID: process.env.PAYTM_MID,
            WEBSITE: process.env.PAYTM_WEBSITE,
            INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID,
            CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
            ORDER_ID: orderId,
            CUST_ID: customerId,
            TXN_AMOUNT: String(amount),
            CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
            MOBILE_NO: mobileNo, 
            EMAIL: emailId, 
        };

        const checksum = await PaytmChecksum.generateSignature(
            paytmParams,
            process.env.PAYTM_MERCHANT_KEY
        );

        const paymentData = {
            ...paytmParams,
            CHECKSUMHASH: checksum,
        };

        res.json({
            success: true,
            paymentData,
            paytm_url: "https://securegw-stage.paytm.in/order/process",
        });
    } catch (error) {
        console.error("Paytm Initiate Payment Error:", error);
        res.status(500).json({ success: false, message: "Failed to initiate payment" });
    }
};

export const paytmCallback = async (req, res) => {
    try {
        const received_data = req.body;
        const paytmChecksum = received_data.CHECKSUMHASH;
        delete received_data.CHECKSUMHASH;

        const isVerifySignature = PaytmChecksum.verifySignature(
            received_data,
            process.env.PAYTM_MERCHANT_KEY,
            paytmChecksum
        );

        if (!isVerifySignature) {
            return res.status(400).send("Checksum mismatched");
        }

        // Verify transaction status with Paytm
        const params = {
            MID: process.env.PAYTM_MID,
            ORDERID: received_data.ORDERID,
        };

        const checksum = await PaytmChecksum.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);

        const post_data = JSON.stringify({
            ...params,
            CHECKSUMHASH: checksum,
        });

        const options = {
            hostname: "securegw-stage.paytm.in",
            port: 443,
            path: "/order/status",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
            },
        };

        let responseData = "";
        const verifyReq = https.request(options, (verifyRes) => {
            verifyRes.on("data", (chunk) => {
                responseData += chunk;
            });

            verifyRes.on("end", () => {
                const result = JSON.parse(responseData);
                console.log("Paytm Payment Verification:", result);

                if (txnStatus === 'SUCCESS') {
                    // Save txn details to temp order or redirect to frontend
                    return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${clientTxnId}`);
                } else {
                    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
                }

            });
        });

        verifyReq.write(post_data);
        verifyReq.end();
    } catch (error) {
        console.error("Paytm Callback Error:", error);
        res.status(500).send("Server error");
    }
};



export { listOrdersPaginated, userOrders, updateStatus, getBestsellers, sabpaisaPaymentCallback }
