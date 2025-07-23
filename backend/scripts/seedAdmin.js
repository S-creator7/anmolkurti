import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import connectDB from '../config/mongodb.js';

const seedAdmin = async () => {
    try {
        
        connectDB()

        // Check if any admin user already exists
        const existingAdmin = await userModel.findOne({ isAdmin: true });
        
        if (existingAdmin) {
            console.log("⚠️  Admin user already exists:");
            console.log(`   📧 Email: ${existingAdmin.email}`);
            console.log(`   👤 Name: ${existingAdmin.name}`);
            console.log("   No action needed. Exiting...");
            await mongoose.disconnect();
            process.exit(0);
        }

        // Default admin credentials (change these!)
        const adminData = {
            name: "Super Admin",
            email: "admin@anmolkurtis.com", // Change this to your email
            password: "Admin@123456", // Change this to a secure password
            isAdmin: true,
            phone: "+917587035699",
            address: {
                street: "Admin Street",
                city: "Admin City", 
                state: "Admin State",
                zipCode: "12345",
                country: "India"
            },
            preferences: {
                newsletter: true,
                smsUpdates: true,
                stockAlerts: true,
                emailNotifications: true
            },
            avatar: "",
            cartData: {},
            stats: {
                totalOrders: 0,
                totalSpent: 0,
                wishlistItems: 0
            }
        };

        // Hash the password
        console.log("🔐 Hashing admin password...");
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        
        // Create admin user
        console.log("👤 Creating admin user...");
        const adminUser = new userModel({
            ...adminData,
            password: hashedPassword
        });

        await adminUser.save();

        console.log("🎉 Admin user created successfully!");
        console.log("📋 Admin Details:");
        console.log(`   📧 Email: ${adminData.email}`);
        console.log(`   🔑 Password: ${adminData.password}`);
        console.log(`   👤 Name: ${adminData.name}`);
        console.log("");
        console.log("🚨 IMPORTANT: Please change these credentials after first login!");
        console.log("🔒 You can now log in to the admin dashboard with these credentials.");

    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);
        process.exit(1);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});

// Run the seed function
console.log("🌱 Starting admin user seeding process...");
seedAdmin(); 