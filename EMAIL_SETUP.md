# Email Setup Guide

This guide explains how to set up email functionality for the London Chauffeur Hire booking system.

## Overview

The email system sends two types of confirmation emails:
1. **Payment Confirmation Email** - Sent when payment is successfully processed (webhook)
2. **Booking Confirmation Email** - Sent when operator manually changes booking status to 'confirmed'

## Environment Variables

Add these environment variables to your `.env.local` file and Vercel deployment:

```env
# Email Configuration (already set up for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Email Flow

### 1. Payment Confirmation Email
- **Trigger**: Stripe webhook when payment is successful
- **When**: Immediately after payment completion
- **Content**: Payment confirmation, amount paid, payment method, next steps

### 2. Booking Confirmation Email
- **Trigger**: Admin manually changes booking status to 'confirmed'
- **When**: When operator confirms the booking is ready
- **Content**: Booking details, service information, important instructions

## Gmail Setup (Recommended)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account settings
- Navigate to Security → 2-Step Verification → App passwords
- Generate a new app password for "Mail"
- Use this password as your `EMAIL_PASS`

### 3. Alternative: Less Secure Apps (Not Recommended)
If you don't want to use 2FA, you can enable "Less secure app access" in your Google Account settings, but this is not recommended for security reasons.

## Other Email Providers

You can use other email providers by modifying the transporter configuration in `src/lib/email.ts`:

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Yahoo
```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Custom SMTP
```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing the Email System

### 1. Admin Dashboard Test
- Log into the admin dashboard
- Go to the Bookings tab
- Click "Test Email" button
- Enter an email address and select email type
- Click "Send Test Email"

### 2. API Test
You can also test the email API directly:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "testType": "booking"}'
```

### 3. Real Booking Test
- Create a real booking through the website
- Complete the payment process (payment confirmation email sent)
- In admin dashboard, change booking status to 'confirmed' (booking confirmation email sent)

## Email Templates

The email templates are located in `src/lib/email.ts` and include:

### Payment Confirmation Email
- Payment confirmation with success indicator
- Amount paid and payment method
- Payment date and booking reference
- Next steps for customer

### Booking Confirmation Email
- Booking reference and details
- Service information and timing
- Pickup/dropoff locations
- Passenger and baggage information
- Important instructions for customers
- Contact information

## Admin Booking Management

### How to Send Booking Confirmation Email
1. Log into the admin dashboard
2. Go to the Bookings tab
3. Find the booking you want to confirm
4. Either:
   - Change the status dropdown to "Confirmed", OR
   - Click "Mark Confirmed" button in the booking details
5. The booking confirmation email will be sent automatically

### Booking Status Options
- **Pending**: Initial booking status
- **Confirmed**: Booking is confirmed (triggers email)
- **Success**: Booking completed successfully
- **Canceled**: Booking was canceled

## Customizing Email Templates

To customize the email templates:

1. Edit the `emailTemplates` object in `src/lib/email.ts`
2. Modify the HTML content and styling
3. Update the subject lines if needed
4. Test with the admin dashboard

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your email and password
   - Ensure 2FA is enabled and app password is used
   - Verify email provider settings

2. **Emails Not Sending**
   - Check environment variables are set correctly
   - Verify email provider allows SMTP access
   - Check server logs for error messages

3. **Emails Going to Spam**
   - Use a business email address
   - Configure SPF and DKIM records
   - Avoid spam trigger words in subject lines

### Debug Mode

Enable debug logging by adding this to your email configuration:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
});
```

## Security Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **App Passwords**: Use app passwords instead of regular passwords
3. **Rate Limiting**: Consider implementing rate limiting for email sending
4. **Email Validation**: Validate email addresses before sending

## Production Deployment

For production deployment:

1. Set environment variables in Vercel dashboard
2. Use a business email address
3. Configure proper DNS records (SPF, DKIM, DMARC)
4. Monitor email delivery rates
5. Set up email analytics if needed

## Support

If you encounter issues with email setup:

1. Check the server logs for error messages
2. Verify environment variables are correctly set
3. Test with the admin dashboard email test feature
4. Check your email provider's SMTP settings 