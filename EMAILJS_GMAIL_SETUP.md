# EmailJS Gmail Setup Guide

## 🚨 Fix for "412Gmail_API: Request had insufficient authentication scopes"

This error occurs because Gmail's OAuth requires additional scopes. Here's how to fix it:

## ✅ **Solution 1: Use Gmail with App Password (Recommended)**

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password

1. In Google Account Settings → Security
2. Click "App passwords" (under 2-Step Verification)
3. Select "Mail" and "Other (Custom name)"
4. Name it "EmailJS" and click "Generate"
5. **Copy the 16-character password** (it looks like: xxxx xxxx xxxx xxxx)

### Step 3: Configure EmailJS

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click "Email Services" → "Add New Service"
3. Choose "Gmail"
4. Use these settings:
   - **Email**: your-gmail@gmail.com
   - **Password**: [The 16-character app password from Step 2]
   - **Name**: Gmail (or any name you prefer)

### Step 4: Test the Connection

1. Click "Test Connection" in EmailJS
2. If successful, you'll see "Connected successfully"

## 🔄 **Solution 2: Use Outlook/Hotmail Instead**

If Gmail continues to have issues:

### Step 1: Use Outlook

1. Go to EmailJS Dashboard
2. Add New Service → "Outlook"
3. Use your Outlook/Hotmail credentials
4. No app password needed

### Step 2: Alternative Email Services

- **Yahoo Mail** - Works well with EmailJS
- **ProtonMail** - Good privacy-focused option
- **Zoho Mail** - Professional email service

## 🛠️ **Solution 3: Use SMTP with Custom Domain**

If you have a custom domain:

### Step 1: Get SMTP Credentials

1. Contact your domain provider (GoDaddy, Namecheap, etc.)
2. Ask for SMTP settings:
   - SMTP Server: smtp.yourdomain.com
   - Port: 587 (or 465 for SSL)
   - Username: your-email@yourdomain.com
   - Password: your email password

### Step 2: Configure in EmailJS

1. Add New Service → "Custom SMTP"
2. Enter your SMTP credentials
3. Test the connection

## 📧 **Solution 4: Use EmailJS's Built-in Email Service**

### Step 1: Use EmailJS Email

1. Go to EmailJS Dashboard
2. Add New Service → "EmailJS"
3. This uses EmailJS's own email service
4. No external email setup needed

## 🔍 **Troubleshooting Steps**

### If Still Getting the Error:

1. **Clear Browser Cache**

   - Clear all browser data
   - Try in incognito/private mode

2. **Check Gmail Settings**

   - Go to Gmail → Settings → Accounts and Import
   - Make sure "Less secure app access" is OFF
   - Use app password instead

3. **Verify App Password**

   - Generate a new app password
   - Make sure to copy all 16 characters
   - Don't include spaces

4. **Check EmailJS Service**
   - Delete the existing Gmail service
   - Create a new one with fresh credentials

## ✅ **Recommended Setup Process**

### For Beginners (Use This):

1. **Enable 2FA** on your Google account
2. **Generate app password** for EmailJS
3. **Use app password** in EmailJS (not your regular Gmail password)
4. **Test connection** before proceeding

### Alternative (Easier):

1. **Use Outlook/Hotmail** instead of Gmail
2. **No app password needed**
3. **Works immediately**

## 🎯 **Quick Fix Summary**

The error happens because:

- Gmail requires OAuth2 with specific scopes
- EmailJS's Gmail integration needs app passwords
- Regular Gmail passwords won't work with API access

**Solution**: Use app passwords instead of regular passwords!

## 📞 **Still Having Issues?**

### Contact Support:

- **EmailJS Support**: [support@emailjs.com](mailto:support@emailjs.com)
- **Google Support**: [Google Account Help](https://support.google.com/accounts)

### Alternative Services:

- **Mailchimp** - Free up to 2,000 subscribers
- **ConvertKit** - Free up to 1,000 subscribers
- **MailerLite** - Free up to 1,000 subscribers

## 🚀 **Pro Tip**

Once you get EmailJS working, you can:

1. **Send welcome emails** to new subscribers
2. **Automate notifications** when someone signs up
3. **Track signups** in your email dashboard
4. **Export subscriber lists** for backup
