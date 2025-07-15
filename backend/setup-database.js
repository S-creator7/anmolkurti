import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import userModel from './models/userModel.js';
import productModel from './models/productModel.js';
import couponModel from './models/couponModel.js';
import filterModel from './models/filterModel.js';

dotenv.config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('Please create a .env file with your MongoDB connection string');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB - skyroot-dev database');

    // Clear existing data (optional)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      console.log('🗑️  Clearing existing data...');
      await userModel.deleteMany({});
      await productModel.deleteMany({});
      await couponModel.deleteMany({});
      await filterModel.deleteMany({});
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@anmolkurtis.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await userModel.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample coupons with proper required fields
    const coupons = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: 'Get 10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderAmount: 500,
        maximumDiscountAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 1000,
        usedCount: 0,
        couponType: 'first_order',
        firstTimeUserOnly: true,
        maximumUsagePerUser: 1,
        termsAndConditions: [
          'Valid for first-time users only',
          'Cannot be combined with other offers',
          'Minimum order value ₹500'
        ]
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on orders above ₹1000',
        discountType: 'free_shipping',
        discountValue: 50,
        minimumOrderAmount: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 500,
        usedCount: 0,
        couponType: 'public',
        maximumUsagePerUser: 5,
        termsAndConditions: [
          'Valid on orders above ₹1000',
          'Free shipping applicable on standard delivery',
          'Not valid on express delivery'
        ]
      },
      {
        code: 'SAVE20',
        name: 'Summer Sale',
        description: 'Get 20% off on all summer collection',
        discountType: 'percentage',
        discountValue: 20,
        minimumOrderAmount: 800,
        maximumDiscountAmount: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: 200,
        usedCount: 0,
        couponType: 'seasonal',
        maximumUsagePerUser: 3,
        termsAndConditions: [
          'Valid on summer collection only',
          'Maximum discount ₹500',
          'Cannot be combined with other offers'
        ]
      }
    ];

    for (const coupon of coupons) {
      const existingCoupon = await couponModel.findOne({ code: coupon.code });
      if (!existingCoupon) {
        await couponModel.create(coupon);
        console.log(`✅ Coupon ${coupon.code} created`);
      } else {
        console.log(`ℹ️  Coupon ${coupon.code} already exists`);
      }
    }

    // Create test users for development
    const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
    if (DEVELOPMENT_MODE) {
      const testUsers = [
        {
          name: 'Test Admin',
          email: 'admin@test.com',
          password: await bcrypt.hash('password123', 10)
        },
        {
          name: 'Test Customer',
          email: 'customer@test.com',
          password: await bcrypt.hash('password123', 10)
        }
      ];

      for (const userData of testUsers) {
        const existingUser = await userModel.findOne({ email: userData.email });
        if (!existingUser) {
          await userModel.create(userData);
          console.log(`✅ Test user ${userData.email} created`);
        } else {
          console.log(`ℹ️  Test user ${userData.email} already exists`);
        }
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Collections Created:');
    console.log('✅ users - User accounts');
    console.log('✅ products - Product catalog');
    console.log('✅ orders - Customer orders');
    console.log('✅ carts - Shopping cart');
    console.log('✅ coupons - Discount codes');
    console.log('✅ filters - Product filters (use /api/filter/initialize to set up default filters)');

    console.log('\n🔧 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Initialize default filters via API: POST /api/filter/initialize');
    console.log('3. Add products via admin panel');
    console.log('4. Test the application');

    if (DEVELOPMENT_MODE) {
      console.log('\n👤 Development Users:');
      console.log('📧 Admin: admin@test.com / password123');
      console.log('📧 Customer: customer@test.com / password123');
    }

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    mongoose.disconnect();
  }
};

setupDatabase(); 