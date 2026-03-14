# 📧 Email Configuration Guide

## Setup Email for PIN Reset

This guide explains how to configure email service for PIN reset functionality.

## Quick Setup (Gmail)

### 1. Generate Gmail App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in to your Google account
3. Select **App passwords** from the left menu
4. In the **App** dropdown, select **Mail**
5. In the **Device** dropdown, select **Other**
6. Enter "Bakso Premium" as the device name
7. Click **Generate**
8. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Configure .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your App Password (no spaces)
EMAIL_FROM=Bakso Premium <your-email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

### 3. Test Email Configuration

Run the test script:

```bash
node test-email.js
```

Expected output:
```
📧 Sending test email...
✅ Email sent successfully: { messageId: '...' }
```

## Alternative Email Services

### Outlook

```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
EMAIL_FROM=Bakso Premium <your-email@outlook.com>
```

### Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-yahoo-app-password
EMAIL_FROM=Bakso Premium <your-email@yahoo.com>
```

### SendGrid

```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Bakso Premium <noreply@bakso.com>
```

### Mailgun

```env
EMAIL_SERVICE=mailgun
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-api-key
EMAIL_FROM=Bakso Premium <noreply@your-domain.com>
```

## Troubleshooting

### "Invalid login" Error

- Make sure you're using **App Password**, not your regular password
- For Gmail, enable 2-Factor Authentication first
- Check for typos in email address

### "Connection timeout" Error

- Check your internet connection
- Verify EMAIL_SERVICE is correct
- Try using port 587 instead of 465

### Email not received

- Check spam/junk folder
- Verify email address is correct
- Wait up to 5 minutes for delivery

## Security Best Practices

1. **Never commit .env file** - It's in .gitignore
2. **Use App Passwords** - Don't use your main password
3. **Rotate passwords regularly** - Update every 90 days
4. **Use dedicated email** - Create a separate email for production

## Production Deployment

For production, consider using:

- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month (first 3 months)
- **AWS SES** - Pay-as-you-go, very cheap

Example for SendGrid:

```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Bakso Premium <noreply@bakso.com>
```

## Email Template Preview

The PIN reset email includes:

- 🍜 Bakso Premium branded header
- 🔑 Reset PIN button (orange gradient)
- ⏰ 1-hour expiry warning
- 🔒 Security notice
- 📧 Plain text fallback

## API Endpoint

```http
POST /api/customer-pin/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:

```json
{
  "success": true,
  "message": "Link reset PIN telah dikirim ke email Anda",
  "reset_link": "http://localhost:5173/reset-pin?token=...",
  "reset_token": "..."
}
```

## Support

If you encounter issues:

1. Check logs: `tail -f logs/error.log`
2. Test with test-email.js
3. Verify .env configuration
4. Check spam folder

---

**Made with 🍜 for Bakso Premium**
