#!/bin/bash

echo "🗄️  Setting up Local MongoDB on VPS"
echo "===================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to be run as root (use sudo)"
    exit 1
fi

# Update package list
echo "📦 Updating package list..."
apt update

# Install MongoDB
echo "📦 Installing MongoDB..."
apt install -y mongodb

# Start MongoDB service
echo "🚀 Starting MongoDB service..."
systemctl start mongodb
systemctl enable mongodb

# Check if MongoDB is running
if systemctl is-active --quiet mongodb; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB failed to start"
    exit 1
fi

# Create data directory
echo "📁 Creating data directory..."
mkdir -p /data/db
chown -R mongodb:mongodb /data/db

# Configure MongoDB for production
echo "⚙️  Configuring MongoDB..."
cat > /etc/mongodb.conf << EOF
# MongoDB configuration
dbpath=/var/lib/mongodb
logpath=/var/log/mongodb/mongodb.log
logappend=true
bind_ip=127.0.0.1
port=27017
auth=false
EOF

# Restart MongoDB with new config
systemctl restart mongodb

# Test connection
echo "🧪 Testing MongoDB connection..."
if mongo --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ MongoDB connection failed"
    exit 1
fi

# Create database user (optional)
echo "👤 Creating database user..."
mongo --eval "
use admin
db.createUser({
  user: 'anmoluser',
  pwd: 'anmolpassword123',
  roles: [{ role: 'readWrite', db: 'e-commerce' }]
})
"

echo ""
echo "🎉 Local MongoDB setup completed!"
echo ""
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 27017"
echo "   Database: e-commerce"
echo "   Username: anmoluser"
echo "   Password: anmolpassword123"
echo ""
echo "🔧 Update your .env file with:"
echo "   MONGODB_URI=mongodb://anmoluser:anmolpassword123@localhost:27017"
echo ""
echo "📊 MongoDB status:"
systemctl status mongodb --no-pager -l 