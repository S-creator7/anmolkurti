# ☁️ Cloudinary Setup Guide

## Step 1: Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Click "Sign Up For Free"
3. Create your account

## Step 2: Get Your Credentials
1. After signing up, go to your Dashboard
2. Copy these values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnop`)

## Step 3: Update .env File
Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Step 4: Test Image Upload
1. Start your backend server
2. Go to admin panel
3. Try uploading a product image
4. Check if it appears in your Cloudinary dashboard

## ✅ Features Included:
- **Automatic compression** - Images optimized for web
- **Multiple formats** - JPEG, PNG, WebP support
- **Size validation** - Max 5MB per image
- **Smart cropping** - Automatic image optimization
- **Secure URLs** - HTTPS image delivery

## 🎯 Benefits:
- **Faster loading** - Compressed images
- **Better SEO** - Optimized image sizes
- **Mobile friendly** - Responsive images
- **CDN delivery** - Fast global access

## 📊 Free Plan Limits:
- **25 GB storage**
- **25 GB bandwidth/month**
- **Perfect for e-commerce**

**Your images will be automatically compressed and optimized!** 🚀 