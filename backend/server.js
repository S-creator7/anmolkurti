import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import filterRouter from './routes/filterRoute.js'
import couponRouter from './routes/couponRoute.js'
import wishlistRouter from './routes/wishlistRoute.js'
import contactRouter from './routes/contactRoute.js'
import dotenv from 'dotenv';
import { checkStockAlerts } from "./services/stockAlertChecker.js";
import cron from "node-cron";
import newsletterRouter from './routes/newsletterRoute.js';

dotenv.config();

// App Config
const app = express()
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// Serve static assets
app.use('/assets', express.static('assets'))

// Run every hour
cron.schedule('0 * * * *', () => {
    checkStockAlerts();
});

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/filter', filterRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on PORT : '+ port))
