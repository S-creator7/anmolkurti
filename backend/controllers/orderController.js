import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import crypto from 'crypto';
import shortid from "shortid";
import tempOrderModel from "../models/tempOrderModel.js"
import productModel from "../models/productModel.js";

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
})

// Placing orders using COD Method
const placeOrder = async (req, res) => {

    try {

        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()
        await updateStock(items); // Deduct stock

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {

        const { userId, items, amount, address } = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
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
            line_items,
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
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
             const order = await orderModel.findById(orderId);
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
        const { userId, items, amount, address } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: shortid.generate(),
            payment_capture,
            notes: {
                userId,
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
        await tempOrderModel.create({
            razorpayOrderId: order.id,
            userId,
            items,
            address,
            amount,
        });

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
        console.error("Razorpay Error:", error);
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

        const { userId, items, address, amount } = orderMeta;

        await orderModel.create({
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: true,
            date: Date.now()
        });

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        await updateStock(orderMeta.items); // Deduct stock

        res.json({ success: true, message: "Payment Successful" });

    } catch (error) {
        console.log(error);
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


// All Orders data for Admin Panel
const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find({})
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// User Order Data For Forntend
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

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
        const product = await productModel.findById(item.id);
        if (!product) continue;

        // Update stock for each size/quantity
        for (const [size, quantity] of Object.entries(item.sizes)) {
            const currentStock = product.stock.get(size) || 0;
            product.stock.set(size, Math.max(0, currentStock - quantity));
        }

        await product.save();
    }
}

export { verifyRazorpay, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }