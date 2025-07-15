import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, resetToken, isAdmin = false) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.error('❌ RESEND_API_KEY not configured properly');
      return { success: false, error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' };
    }

    const resetUrl = isAdmin 
      ? `${process.env.ADMIN_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
      : `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;

    const emailTemplate = isAdmin ? getAdminResetTemplate(resetUrl) : getCustomerResetTemplate(resetUrl);

    // Use Resend's verified domain for testing, or your verified domain
    const fromEmail = process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'noreply@anmolkurtis.com' 
      ? process.env.FROM_EMAIL 
      : 'onboarding@resend.dev'; // Resend's default verified domain

    console.log(`📧 Sending ${isAdmin ? 'admin' : 'customer'} password reset email to: ${email}`);
    console.log(`📧 From: ${fromEmail}`);
    console.log(`📧 API Key configured: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);

    const response = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: isAdmin ? 'Admin Password Reset - Anmol Kurti\'s' : 'Password Reset - Anmol Kurti\'s',
      html: emailTemplate,
    });

    console.log('✅ Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log specific error details
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.response) {
      console.error('Error response:', error.response);
    }
    
    return { success: false, error: error.message };
  }
};

export const sendStockAlert = async (email, product) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.error('❌ RESEND_API_KEY not configured properly');
      return { success: false, error: 'Email service not configured' };
    }

    const emailTemplate = getStockAlertTemplate(product);
    
    const fromEmail = process.env.FROM_EMAIL && process.env.FROM_EMAIL !== 'noreply@anmolkurtis.com' 
      ? process.env.FROM_EMAIL 
      : 'onboarding@resend.dev';

    console.log(`📧 Sending stock alert email to: ${email}`);
    
    const response = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `🎉 ${product.name} is Back in Stock! - Anmol Kurti's`,
      html: emailTemplate,
    });

    console.log('✅ Stock alert email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Stock alert email sending failed:', error);
    return { success: false, error: error.message };
  }
};

const getCustomerResetTemplate = (resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .content h2 { color: #333; margin-bottom: 20px; font-size: 24px; }
        .content p { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .security-tips { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Anmol Kurti's</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello!</p>
            <p>We received a request to reset your password for your Anmol Kurti's account. If you made this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                    <li>This link will expire in 1 hour for your security</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this reset link with anyone</li>
                </ul>
                </div>
                
            <div class="security-tips">
                <h3>🔐 Password Security Tips:</h3>
                <ul>
                    <li>Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                    <li>Don't reuse passwords from other accounts</li>
                    <li>Consider using a password manager</li>
                </ul>
                </div>
                
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
                ${resetUrl}
            </p>
            
            <p>Best regards,<br>The Anmol Kurti's Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Anmol Kurti's. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

const getAdminResetTemplate = (resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Password Reset</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; }
        .admin-badge { background-color: #ffffff; color: #e74c3c; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; display: inline-block; }
        .content { padding: 40px 30px; }
        .content h2 { color: #333; margin-bottom: 20px; font-size: 24px; }
        .content p { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background-color: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .security-alert { background-color: #fff5f5; border: 2px solid #fed7d7; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Admin Panel</h1>
            <div class="admin-badge">ADMIN ACCESS</div>
        </div>
        <div class="content">
            <h2>Admin Password Reset Request</h2>
            <p>Hello Administrator,</p>
            <p>A password reset has been requested for your admin account at Anmol Kurti's. If you initiated this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Admin Password</a>
            </div>
            
            <div class="security-alert">
                <strong>🚨 High Security Alert:</strong>
                <ul>
                    <li><strong>Admin Account:</strong> This is a privileged account with full system access</li>
                    <li><strong>Time Limit:</strong> This link expires in 1 hour</li>
                    <li><strong>One-Time Use:</strong> Link becomes invalid after first use</li>
                    <li><strong>IP Tracking:</strong> All admin password resets are logged for security</li>
                </ul>
            </div>
            
            <div class="warning">
                <strong>⚠️ If you did not request this password reset:</strong>
                <ol>
                    <li>Do NOT click the reset link</li>
                    <li>Forward this email to your IT security team immediately</li>
                    <li>Check your admin account for any suspicious activity</li>
                    <li>Consider changing your password immediately via a secure connection</li>
                </ol>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
                ${resetUrl}
            </p>
            
            <p>For security purposes, this email was sent from an automated system. Do not reply to this email.</p>
            
            <p>Security Team,<br>Anmol Kurti's Admin System</p>
        </div>
        <div class="footer">
            <p>© 2024 Anmol Kurti's Admin Panel. All rights reserved.</p>
            <p><strong>Security Notice:</strong> This email contains sensitive admin information.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendPasswordResetSuccessEmail = async (email, isAdmin = false) => {
  try {
    const template = getPasswordResetSuccessTemplate(isAdmin);
    
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@anmolkurtis.com',
      to: [email],
      subject: isAdmin ? 'Admin Password Reset Successful' : 'Password Reset Successful',
      html: template,
    });

    return { success: true, data: response };
    } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

const getPasswordResetSuccessTemplate = (isAdmin) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isAdmin ? '🔐 Admin Panel' : '🌸 Anmol Kurti\'s'}</h1>
        </div>
        <div class="content">
            <div class="success-icon">✅</div>
            <h2>Password Reset Successful!</h2>
            <p>Your ${isAdmin ? 'admin ' : ''}password has been successfully reset. You can now log in with your new password.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Anmol Kurti's Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Anmol Kurti's. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getStockAlertTemplate = (product) => {
  const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/product/${product._id}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Back in Stock</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .product-card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin: 20px 0; background-color: #fafafa; }
        .product-image { width: 150px; height: 150px; border-radius: 8px; margin: 0 auto 15px auto; display: block; object-fit: cover; }
        .product-name { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 10px; text-align: center; }
        .product-price { font-size: 20px; color: #ff6b6b; font-weight: bold; text-align: center; margin-bottom: 15px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .urgency { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .availability { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Anmol Kurti's</h1>
        </div>
        <div class="content">
            <h2>🎉 Great News! Your Item is Back!</h2>
            <p>The product you were waiting for is now available. Don't miss out - grab yours before it's gone again!</p>
            
            <div class="product-card">
                ${product.image && product.image.length > 0 ? 
                    `<img src="${product.image[0]}" alt="${product.name}" class="product-image" />` : 
                    '<div style="width: 150px; height: 150px; background-color: #f0f0f0; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #999;">No Image</div>'
                }
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price}</div>
                
                ${product.hasSize ? `
                    <div class="availability">
                        <strong>✅ Available Sizes:</strong><br>
                        ${product.sizes.map(size => {
                            const stock = product.stock instanceof Map ? product.stock.get(size) : product.stock[size];
                            return stock > 0 ? `<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; margin: 2px; display: inline-block;">${size}</span>` : '';
                        }).filter(Boolean).join(' ')}
                    </div>
                ` : `
                    <div class="availability">
                        <strong>✅ In Stock:</strong> ${typeof product.stock === 'number' ? product.stock : 'Available'} pieces available
                    </div>
                `}
            </div>
            
            <div class="urgency">
                <strong>⏰ Act Fast!</strong><br>
                Popular items sell out quickly. Secure yours now to avoid disappointment.
            </div>
            
            <div style="text-align: center;">
                <a href="${productUrl}" class="button">Shop Now</a>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <small>
                    You received this email because you requested to be notified when this item was back in stock.<br>
                    <a href="${productUrl}" style="color: #ff6b6b;">Visit Product Page</a>
                </small>
            </p>
            
            <p>Happy Shopping!<br>The Anmol Kurti's Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Anmol Kurti's. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
};