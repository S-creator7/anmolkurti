#!/bin/bash

echo "🚀 Anmol Kurti's E-commerce Database Setup"
echo "=========================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your MongoDB connection string"
    echo ""
    echo "Example .env file:"
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net"
    echo "JWT_SECRET=your_secret_key_here"
    echo "ADMIN_EMAIL=admin@anmolkurtis.com"
    echo "ADMIN_PASSWORD=admin123"
    echo ""
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database setup
echo "🗄️  Setting up database..."
node setup-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start the backend server: npm run dev"
    echo "2. Start the admin panel: cd ../admin && npm run dev"
    echo "3. Start the frontend: cd ../frontend && npm run dev"
    echo ""
    echo "🔑 Admin login:"
    echo "   Email: admin@anmolkurtis.com"
    echo "   Password: admin123"
    echo ""
else
    echo "❌ Setup failed! Please check your MongoDB connection string"
    exit 1
fi 