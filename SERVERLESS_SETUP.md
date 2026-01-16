# Serverless Functions Setup Guide (Option 2)

## Overview

This guide shows you how to move your secrets to serverless functions, keeping them secure on the server and never exposing them to the browser.

## Architecture

```
Browser (newsletter.js) 
    ↓ (API calls)
Serverless Function (Vercel/Netlify)
    ↓ (uses secrets)
JSONBin.io API
```

**Benefits:**
- ✅ Secrets never reach the browser
- ✅ API keys stay secure on the server
- ✅ Better security for production
- ✅ Free tier available on Vercel/Netlify

## Option A: Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Create API Functions Directory

Create a `api/` folder in your project root:

```
IrieDevelopment/
├── api/
│   ├── subscribers.js          # Get subscribers
│   └── subscribers-save.js    # Save subscribers
├── newsletter.js
├── index.html
└── vercel.json
```

### Step 3: Create Serverless Functions

See the `api/` folder files created below.

### Step 4: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```

3. **Add secrets to Vercel:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add:
     - `JSONBIN_ACCESS_KEY` = your JSONBin access key
     - `JSONBIN_BIN_ID` = your JSONBin bin ID
     - `EMAILJS_USER_ID` = your EmailJS user ID
     - `EMAILJS_SERVICE_ID` = your EmailJS service ID
     - `EMAILJS_TEMPLATE_ID` = your EmailJS template ID

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Get your API URL:**
   - Vercel will give you a URL like: `https://your-project.vercel.app`
   - Your API endpoints will be:
     - `https://your-project.vercel.app/api/subscribers`
     - `https://your-project.vercel.app/api/subscribers-save`

### Step 5: Update newsletter.js

Update `newsletter.js` to use your API endpoints instead of calling JSONBin directly. See the updated code below.

---

## Option B: Netlify Functions

### Step 1: Create Functions Directory

Create a `netlify/functions/` folder:

```
IrieDevelopment/
├── netlify/
│   └── functions/
│       ├── subscribers.js
│       └── subscribers-save.js
├── newsletter.js
└── netlify.toml
```

### Step 2: Create Serverless Functions

Similar structure to Vercel, but using Netlify's format.

### Step 3: Deploy to Netlify

1. **Connect your GitHub repo** to Netlify
2. **Add environment variables** in Netlify dashboard:
   - Settings → Environment variables
   - Add the same secrets as Vercel
3. **Deploy automatically** on push to main

---

## Option C: Cloudflare Workers (Advanced)

For maximum performance and global edge deployment.

---

## Security Notes

1. **CORS Configuration:** Your serverless functions should only accept requests from your domain
2. **Rate Limiting:** Consider adding rate limiting to prevent abuse
3. **Authentication:** For admin operations, add authentication tokens

---

## Migration Checklist

- [ ] Create serverless functions
- [ ] Add secrets to hosting platform (Vercel/Netlify)
- [ ] Update `newsletter.js` to use API endpoints
- [ ] Test locally
- [ ] Deploy and test production
- [ ] Remove secrets from GitHub Secrets (optional, for cleanup)
- [ ] Remove `env-config.js` generation from GitHub Actions (optional)

---

## Testing

After deployment, test:

1. **Load subscribers:**
   ```javascript
   fetch('https://your-api.vercel.app/api/subscribers')
     .then(r => r.json())
     .then(console.log)
   ```

2. **Save subscribers:**
   ```javascript
   fetch('https://your-api.vercel.app/api/subscribers-save', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ subscribers: ['test@example.com'] })
   })
   ```

---

## Next Steps

1. Choose your platform (Vercel recommended)
2. Create the API functions (see files below)
3. Update `newsletter.js` (see updated code below)
4. Deploy and test
