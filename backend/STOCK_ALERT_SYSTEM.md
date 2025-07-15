# Stock Alert System

This document describes the stock alert system implemented in the e-commerce application.

## Overview

The stock alert system allows customers to subscribe to notifications when products come back in stock. The system automatically checks for products with stock alerts and sends email notifications when stock becomes available.

## Components

### 1. Product Model (`productModel.js`)
- Added `stockAlerts` field: Array of email addresses subscribed to stock alerts
- Supports both products with sizes and without sizes

### 2. Stock Alert Controller (`productController.js`)
- `addStockAlert`: Allows customers to subscribe to stock alerts
- `triggerStockAlerts`: Manual trigger for testing (admin only)
- Includes validation for email format and stock availability

### 3. Stock Alert Checker Service (`stockAlertChecker.js`)
- `checkStockAlerts`: Automatically checks products with stock alerts
- Handles both sized and non-sized products
- Sends email notifications when stock becomes available
- Clears alerts after sending notifications

### 4. Email Service (`emailService.js`)
- `sendStockAlert`: Sends formatted email notifications
- Uses SendGrid for email delivery
- Includes product details and direct link to product

## Setup

### 1. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration for Stock Alerts
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourstore.com
FRONTEND_URL=http://localhost:3000
```

### 2. SendGrid Setup
1. Create a SendGrid account
2. Generate an API key
3. Verify your sender email address
4. Add the API key to your environment variables

### 3. Dependencies
Make sure these packages are installed:
```bash
npm install @sendgrid/mail node-cron
```

## API Endpoints

### Subscribe to Stock Alert
```
POST /api/product/stock-alert
Body: { productId: "string", email: "string" }
```

### Manual Trigger (Admin Only)
```
POST /api/product/trigger-stock-alerts
Headers: { token: "admin_token" }
```

## How It Works

### 1. Customer Subscription
1. Customer visits a product page that's out of stock
2. Customer enters email and subscribes to stock alert
3. Email is added to product's `stockAlerts` array

### 2. Automatic Checking
1. Cron job runs every hour (`0 * * * *`)
2. Finds all products with stock alerts
3. Checks if any size has stock (for sized products) or total stock (for non-sized)
4. If stock is available, sends email notifications
5. Clears stock alerts after sending

### 3. Email Notification
- Sends formatted HTML email with product details
- Includes direct link to product page
- Informs customer they won't receive more alerts unless they subscribe again

## Testing

### Manual Test
Use the test script to verify functionality:
```bash
node test-stock-alerts.js
```

### Manual Trigger
Use the admin endpoint to manually trigger stock alert checks:
```bash
curl -X POST http://localhost:4000/api/product/trigger-stock-alerts \
  -H "token: your_admin_token"
```

## Features

### ✅ Implemented
- Email subscription for stock alerts
- Automatic hourly checking
- Support for both sized and non-sized products
- Email validation
- Duplicate subscription prevention
- Stock availability checking before subscription
- Formatted email notifications
- Automatic alert clearing after notification

### 🔄 Scheduled
- Cron job runs every hour
- Configurable schedule in `server.js`

### 📧 Email Features
- Professional HTML email template
- Product details and pricing
- Direct link to product page
- Responsive design
- Clear unsubscribe message

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SendGrid API key
   - Verify sender email is verified
   - Check console logs for errors

2. **Stock alerts not clearing**
   - Check if stock is actually available
   - Verify product model structure
   - Check MongoDB connection

3. **Cron job not running**
   - Verify `node-cron` is installed
   - Check server logs for cron errors
   - Test manual trigger endpoint

### Debug Mode
Enable detailed logging by adding to your environment:
```env
DEBUG_STOCK_ALERTS=true
```

## Security Considerations

1. **Email Validation**: Basic regex validation for email format
2. **Rate Limiting**: Consider implementing rate limiting for subscriptions
3. **Admin Only**: Manual trigger requires admin authentication
4. **Data Privacy**: Email addresses are stored in product documents

## Future Enhancements

1. **SMS Notifications**: Add SMS support for stock alerts
2. **Push Notifications**: Implement web push notifications
3. **Customizable Schedule**: Allow different check intervals
4. **Bulk Operations**: Admin interface for managing stock alerts
5. **Analytics**: Track stock alert effectiveness 