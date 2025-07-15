# SendGrid Setup for Stock Alerts

This guide will help you set up SendGrid to enable email notifications for stock alerts.

## Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free" or "Sign Up"
3. Create your account with email and password
4. Verify your email address

## Step 2: Generate API Key

1. Log in to your SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Full Access** or **Restricted Access** (Mail Send permissions only)
5. Give it a name like "Stock Alerts API Key"
6. Copy the API key (it starts with "SG.")

## Step 3: Verify Sender Email

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name**: Your store name (e.g., "Anmol Kurtis")
   - **From Email Address**: Your verified email (e.g., "noreply@yourstore.com")
   - **Reply To**: Same as From Email Address
   - **Company Name**: Your company name
   - **Address**: Your business address
   - **City**: Your city
   - **Country**: Your country
4. Click **Create**
5. Check your email and click the verification link

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Email Configuration for Stock Alerts
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourstore.com
FRONTEND_URL=http://localhost:3000
```

## Step 5: Test the Setup

1. Run the test script:
   ```bash
   node test-stock-alerts.js
   ```

2. Check your email for the test notification

## Troubleshooting

### API Key Issues
- Make sure the API key starts with "SG."
- Ensure you have Mail Send permissions
- Check that the API key is not expired

### Sender Verification Issues
- Use a real email address you control
- Check spam folder for verification email
- Make sure the domain is properly configured

### Email Not Sending
- Verify sender email is authenticated
- Check SendGrid dashboard for delivery status
- Look at server logs for error messages

## Production Setup

For production, consider:

1. **Domain Authentication**: Verify your domain with SendGrid
2. **Dedicated IP**: Use a dedicated IP for better deliverability
3. **Email Templates**: Create custom templates in SendGrid
4. **Monitoring**: Set up webhooks for delivery tracking

## Alternative Email Services

If you prefer other email services:

### Mailgun
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
```

### AWS SES
```env
AWS_SES_ACCESS_KEY=your_aws_access_key
AWS_SES_SECRET_KEY=your_aws_secret_key
AWS_SES_REGION=us-east-1
```

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Rate Limiting**: Implement rate limiting for email subscriptions
3. **Email Validation**: Always validate email addresses
4. **Unsubscribe**: Include unsubscribe links in emails
5. **GDPR Compliance**: Ensure compliance with data protection laws

## Cost Considerations

- SendGrid Free Plan: 100 emails/day
- SendGrid Essentials: $14.95/month for 50k emails
- Monitor your usage in the SendGrid dashboard

## Testing Without SendGrid

If you want to test without setting up SendGrid:

1. The system will show mock emails in console
2. Stock alerts will still be processed and cleared
3. You can see the email content in the logs

This allows you to test the stock alert logic without email configuration. 