# ⚡ Quick Start Guide (5 minutes)

## Step 1: Create .env File
Create `backend/.env` file:

```env
MONGODB_URI=mongodb://anmoluser:anmolpassword123@localhost:27017/e-commerce
JWT_SECRET=anmol_kurtis_secret_key_2024
ADMIN_EMAIL=admin@anmolkurtis.com
ADMIN_PASSWORD=admin123
PORT=4000
NODE_ENV=development
```

## Step 2: Run Setup Script
```bash
cd backend
npm install
node setup-database.js
```

## Step 3: Test Everything
```bash
npm run dev
```

## ✅ What Gets Created Automatically:

### 🗄️ Database Collections:
- ✅ **users** - User accounts
- ✅ **products** - Product catalog
- ✅ **orders** - Customer orders
- ✅ **carts** - Shopping cart
- ✅ **coupons** - Discount codes
- ✅ **filters** - Product filters
- ✅ **wishlists** - User wishlists
- ✅ **contacts** - Contact form
- ✅ **tempOrders** - Payment data

### 👤 Admin Account:
- ✅ **Email**: admin@anmolkurtis.com
- ✅ **Password**: admin123

### 🎫 Sample Coupons:
- ✅ **WELCOME10** - 10% off first order
- ✅ **FREESHIP** - Free shipping above ₹1000

### 🏷️ Filter Categories:
- ✅ **Gender**: Women, Men, Children
- ✅ **Category**: Kurtis, Sets, Sarees, Suits
- ✅ **SubCategory**: Printed, Embroidered, Designer, Casual
- ✅ **Occasion**: Casual, Party, Wedding, Office
- ✅ **Price Range**: 0-500, 500-1000, 1000-2000, 2000+

## 🎯 No Manual Work Required!

The setup script handles everything:
- ✅ Creates all database collections
- ✅ Sets up admin user
- ✅ Adds sample coupons
- ✅ Creates filter categories
- ✅ Configures everything automatically

## 🚀 Next Steps After Setup:

1. **Add Products** - Use admin panel
2. **Configure Payments** - Add Stripe/Razorpay keys
3. **Setup Cloudinary** - For image uploads
4. **Customize** - Update branding and content

## 📊 Database Schema Overview:

```
e-commerce/
├── users/          # User accounts
├── products/       # Product catalog
├── orders/         # Customer orders
├── carts/          # Shopping cart
├── coupons/        # Discount codes
├── filters/        # Product filters
├── wishlists/      # User wishlists
├── contacts/       # Contact form
└── tempOrders/     # Payment data
```

**Everything is created automatically!** 🎉 