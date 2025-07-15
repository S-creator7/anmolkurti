import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from './models/productModel.js';
import { checkStockAlerts } from './services/stockAlertChecker.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test function to create a product with stock alerts
const createTestProduct = async () => {
  try {
    // Create a test product that's out of stock
    const testProduct = new productModel({
      name: "Test Product for Stock Alerts",
      description: "This is a test product to verify stock alert functionality",
      price: 999,
      image: ["https://via.placeholder.com/300"],
      gender: "women",
      category: "kurtis",
      subCategory: "casual",
      occasion: ["casual"],
      type: ["cotton"],
      filterTags: ["test"],
      sizes: ["S", "M", "L"],
      hasSize: true,
      bestseller: false,
      date: Date.now(),
      stock: {
        'S': 0,
        'M': 0,
        'L': 0
      },
      stockAlerts: ["test@example.com", "admin@anmolkurtis.com"],
      filters: {}
    });

    await testProduct.save();
    console.log('Test product created with ID:', testProduct._id);
    return testProduct;
  } catch (error) {
    console.error('Error creating test product:', error);
  }
};

// Test function to update stock and trigger alerts
const testStockAlert = async (productId) => {
  try {
    const product = await productModel.findById(productId);
    if (!product) {
      console.log('Product not found');
      return;
    }

    console.log('Current stock alerts:', product.stockAlerts);
    console.log('Current stock:', product.stock);

    // Update stock to trigger alerts - handle both Map and object
    if (product.stock instanceof Map) {
      product.stock.set('S', 5);
      product.stock.set('M', 3);
    } else {
      // Handle as plain object
      product.stock = {
        ...product.stock,
        'S': 5,
        'M': 3
      };
    }
    
    await product.save();

    console.log('Updated stock - S: 5, M: 3');
    console.log('Running stock alert check...');

    // Run the stock alert checker
    await checkStockAlerts();

    // Check if alerts were cleared
    const updatedProduct = await productModel.findById(productId);
    console.log('Stock alerts after check:', updatedProduct.stockAlerts);

  } catch (error) {
    console.error('Error testing stock alert:', error);
  }
};

// Check SendGrid configuration
const checkSendGridConfig = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('\n=== SendGrid Configuration Check ===');
  console.log('SENDGRID_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('SENDGRID_FROM_EMAIL:', fromEmail || 'NOT SET');
  
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('⚠️  WARNING: SendGrid API key not properly configured');
    console.log('   Emails will not be sent. Set SENDGRID_API_KEY in your .env file');
  }
  
  if (!fromEmail) {
    console.log('⚠️  WARNING: SENDGRID_FROM_EMAIL not set');
    console.log('   Set SENDGRID_FROM_EMAIL in your .env file');
  }
  
  console.log('=====================================\n');
};

// Main test function
const runTest = async () => {
  await connectDB();
  
  // Check SendGrid configuration
  checkSendGridConfig();
  
  console.log('Creating test product...');
  const testProduct = await createTestProduct();
  
  if (testProduct) {
    console.log('\nWaiting 2 seconds before testing stock alert...');
    setTimeout(async () => {
      await testStockAlert(testProduct._id);
      console.log('\nTest completed!');
      process.exit(0);
    }, 2000);
  }
};

// Run the test
runTest().catch(console.error); 