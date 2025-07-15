# 🗄️ Local MongoDB Setup on VPS (Step-by-Step)

## Step 1: SSH into Your VPS
```bash
ssh root@your-vps-ip
```

## Step 2: Install MongoDB
```bash
# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify installation
sudo systemctl status mongodb
```

## Step 3: Configure MongoDB
```bash
# Create data directory
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /data/db

# Configure MongoDB
sudo nano /etc/mongodb.conf
```

Add this configuration:
```
# MongoDB configuration
dbpath=/var/lib/mongodb
logpath=/var/log/mongodb/mongodb.log
logappend=true
bind_ip=127.0.0.1
port=27017
auth=false
```

## Step 4: Restart MongoDB
```bash
sudo systemctl restart mongodb
sudo systemctl status mongodb
```

## Step 5: Test Connection
```bash
# Test MongoDB connection
mongo --eval "db.runCommand('ping')"
```

## Step 6: Create Database User (Optional but Recommended)
```bash
mongo --eval "
use admin
db.createUser({
  user: 'anmoluser',
  pwd: 'anmolpassword123',
  roles: [{ role: 'readWrite', db: 'e-commerce' }]
})
"
```

## Step 7: Configure Your Application

### Create .env file in backend directory:
```env
# MongoDB Configuration (Local)
MONGODB_URI=mongodb://anmoluser:anmolpassword123@localhost:27017/e-commerce

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_production_key_here

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=admin@anmolkurtis.com
ADMIN_PASSWORD=your_secure_admin_password

# Server Configuration
PORT=4000
NODE_ENV=production
```

## Step 8: Deploy Your Application

### Install Node.js and PM2
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### Deploy Backend
```bash
# Navigate to your project directory
cd /path/to/your/project/backend

# Install dependencies
npm install

# Setup database
node setup-database.js

# Start with PM2
pm2 start server.js --name "anmol-backend"
pm2 save
pm2 startup
```

### Deploy Frontend
```bash
cd /path/to/your/project/frontend
npm install
npm run build
pm2 serve dist 3000 --name "anmol-frontend"
```

### Deploy Admin Panel
```bash
cd /path/to/your/project/admin
npm install
npm run build
pm2 serve dist 3001 --name "anmol-admin"
```

## Step 9: Configure Nginx (Optional)

### Install Nginx
```bash
sudo apt install nginx
```

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/anmol-kurtis
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/anmol-kurtis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Security Configuration

### Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Step 11: Monitoring and Maintenance

### Check Status
```bash
# Check all services
pm2 status
sudo systemctl status mongodb
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
pm2 logs

# MongoDB logs
sudo tail -f /var/log/mongodb/mongodb.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Backup Database
```bash
# Create backup script
cat > /root/backup-mongodb.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
mongodump --db e-commerce --out $BACKUP_DIR/backup_$DATE
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE
echo "Backup created: backup_$DATE.tar.gz"
EOF

chmod +x /root/backup-mongodb.sh

# Add to crontab for daily backups
echo "0 2 * * * /root/backup-mongodb.sh" | crontab -
```

## ✅ Benefits of Local MongoDB:

### 💰 Cost Savings:
- **$0 database hosting cost**
- **No bandwidth charges**
- **No connection limits**
- **No storage limits**

### 🚀 Performance:
- **Zero network latency**
- **Faster queries**
- **Better user experience**
- **More reliable**

### 🔧 Control:
- **Full data control**
- **Custom configuration**
- **No vendor lock-in**
- **Complete privacy**

## 🎯 Why This is the Right Choice:

1. **Cost Effective**: No additional database costs
2. **Better Performance**: No network latency
3. **Full Control**: Your data, your rules
4. **Reliability**: No external dependencies
5. **Scalability**: Can easily upgrade VPS resources

## 📊 Comparison:

| Feature | Local MongoDB | Atlas Free |
|---------|---------------|------------|
| Cost | $0 | $0 |
| Storage | Unlimited | 512MB |
| Connections | Unlimited | 500 |
| Latency | 0ms | 50-200ms |
| Control | Full | Limited |
| Dependencies | None | External |

**Local MongoDB wins on all counts!** 🏆 