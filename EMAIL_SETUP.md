# 📧 Email Setup Guide

## Current Status

The email service is configured to send invoices after order creation. Currently, it's set up with **Resend API** but will fall back to console logging if not configured.

## Setup Instructions

### Option 1: Using Resend (Recommended - Easy Setup)

1. **Sign up for Resend**:
   - Go to https://resend.com
   - Create a free account (100 emails/day free)
   - Verify your email

2. **Get API Key**:
   - Go to API Keys section
   - Create a new API key
   - Copy the key

3. **Add to Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

   **Note:** For testing, you can use `onboarding@resend.dev` as FROM email (already set as default).

4. **Verify Domain (Optional - For Production)**:
   - In Resend dashboard, add your domain
   - Add DNS records as instructed
   - Once verified, use `noreply@yourdomain.com`

### Option 2: Using Other Services

#### SendGrid
```typescript
// In EmailService.ts, replace sendEmail method with SendGrid API
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: options.to }] }],
    from: { email: process.env.SENDGRID_FROM_EMAIL },
    subject: options.subject,
    content: [
      { type: 'text/html', value: options.html }
    ]
  })
});
```

#### AWS SES
Requires AWS SDK installation:
```bash
npm install @aws-sdk/client-ses
```

#### Nodemailer (SMTP)
```bash
npm install nodemailer
```

Then configure with your SMTP settings (Gmail, Outlook, etc.)

## Testing

1. **Without API Key** (Development):
   - Emails will be logged to console
   - Check server logs when order is created
   - Look for `[EMAIL MOCK]` messages

2. **With API Key** (Production):
   - Real emails will be sent
   - Check customer's inbox
   - Monitor Resend dashboard for delivery status

## Email Template

The invoice email includes:
- ✅ Professional HTML design
- ✅ Order details and items
- ✅ Customer information
- ✅ Total amount
- ✅ Order status
- ✅ Plain text fallback

## Troubleshooting

### Email not sending?
1. Check if `RESEND_API_KEY` is set correctly
2. Verify API key is active in Resend dashboard
3. Check server console for error messages
4. Ensure FROM email is verified in Resend

### Email in spam?
1. Verify your domain in Resend
2. Use a verified FROM email address
3. Add SPF/DKIM records to your domain DNS

### Testing locally?
- Use console logging (default when no API key)
- Or use Resend's test mode
- Check server logs for email content

## Current Implementation

✅ **Email Service**: Configured and ready  
✅ **Invoice Generation**: HTML template with styling  
✅ **Order Integration**: Automatically sends after order creation  
✅ **Error Handling**: Won't fail order if email fails  
✅ **Fallback**: Console logging for development

## Next Steps

1. Sign up for Resend: https://resend.com
2. Add `RESEND_API_KEY` to `.env` file
3. Test with a real order
4. Verify email delivery

---

**Note:** The email service is already integrated into the checkout flow. Once you add the API key, invoices will automatically be sent to customers after order completion.

