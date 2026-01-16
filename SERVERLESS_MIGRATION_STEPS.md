# Step-by-Step Migration to Serverless Functions

Follow these steps to migrate from client-side secrets to serverless functions.

## Prerequisites

- Node.js installed (for Vercel CLI)
- GitHub account
- Vercel account (free tier works)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Create API Functions

The API functions have already been created in the `api/` folder:
- `api/subscribers.js` - Get subscribers
- `api/subscribers-save.js` - Save subscribers

## Step 3: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

## Step 4: Link Your Project

In your project directory:

```bash
cd /Volumes/I.C.T9\ 4TB/Documents/Websites/IrieDevelopment
vercel link
```

Choose:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (create new)
- **Project name?** → irie-development (or your choice)
- **Directory?** → ./

## Step 5: Add Environment Variables to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (one at a time):

```
Name: JSONBIN_ACCESS_KEY
Value: [your JSONBin access key]
Environment: Production, Preview, Development

Name: JSONBIN_BIN_ID
Value: [your JSONBin bin ID]
Environment: Production, Preview, Development

Name: EMAILJS_USER_ID
Value: [your EmailJS user ID]
Environment: Production, Preview, Development

Name: EMAILJS_SERVICE_ID
Value: [your EmailJS service ID]
Environment: Production, Preview, Development

Name: EMAILJS_TEMPLATE_ID
Value: [your EmailJS template ID]
Environment: Production, Preview, Development
```

### Option B: Via Vercel CLI

```bash
vercel env add JSONBIN_ACCESS_KEY
# Paste your value, press Enter
# Select: Production, Preview, Development

vercel env add JSONBIN_BIN_ID
# Paste your value, press Enter
# Select: Production, Preview, Development

# Repeat for other variables...
```

## Step 6: Deploy to Vercel

```bash
vercel --prod
```

This will:
1. Build your project
2. Deploy the API functions
3. Give you a URL like: `https://irie-development.vercel.app`

**Save this URL!** You'll need it in the next step.

## Step 7: Update Your Website Code

### Option A: Update index.html

Add this before loading `newsletter.js`:

```html
<script>
  // Set your serverless API URL
  window.SERVERLESS_API_URL = 'https://your-project.vercel.app/api';
</script>
<script src="newsletter-serverless.js"></script>
```

### Option B: Update newsletter.js

Replace the JSONBin methods with serverless API calls (see `newsletter-serverless.js` for reference).

## Step 8: Update GitHub Actions Workflow (Optional)

If you want to keep using GitHub Pages but use serverless functions for API:

1. Update `deploy.yml` to remove `env-config.js` generation (or keep it for EmailJS only)
2. Your website will call Vercel API functions instead of using client-side secrets

## Step 9: Test Locally

Before deploying to production:

1. **Test API endpoints:**
   ```bash
   # Get subscribers
   curl https://your-project.vercel.app/api/subscribers
   
   # Save subscribers (test)
   curl -X POST https://your-project.vercel.app/api/subscribers-save \
     -H "Content-Type: application/json" \
     -d '{"subscribers":["test@example.com"]}'
   ```

2. **Test in browser:**
   - Open your local `index.html`
   - Check browser console for API calls
   - Verify subscribers load correctly

## Step 10: Deploy Website

### If using GitHub Pages:

1. Push your changes:
   ```bash
   git add .
   git commit -m "Migrate to serverless functions"
   git push origin main
   ```

2. GitHub Actions will deploy automatically

### If using Vercel for hosting:

```bash
vercel --prod
```

## Step 11: Verify Production

1. Visit your live website
2. Open browser DevTools → Network tab
3. Try subscribing to newsletter
4. Verify:
   - ✅ API calls go to `your-project.vercel.app/api/*`
   - ✅ No secrets visible in browser
   - ✅ Subscribers save correctly
   - ✅ Welcome emails send

## Step 12: Cleanup (Optional)

After verifying everything works:

1. **Remove secrets from GitHub Secrets** (they're now in Vercel)
2. **Remove `env-config.js` generation** from GitHub Actions (if not using EmailJS client-side)
3. **Update `.gitignore`** if needed

## Troubleshooting

### API returns 404

- Check your API URL is correct
- Verify functions are deployed: `vercel ls`
- Check Vercel dashboard for deployment logs

### CORS errors

- Update `allowedOrigins` in `api/subscribers.js` and `api/subscribers-save.js`
- Add your domain to the list

### Environment variables not working

- Verify variables are set in Vercel dashboard
- Check they're set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables: `vercel --prod`

### Secrets still visible

- Make sure you're using `newsletter-serverless.js` or updated `newsletter.js`
- Check browser DevTools → Sources → No `env-config.js` with secrets
- Verify API calls go to Vercel, not JSONBin directly

## Next Steps

- ✅ Secrets are now secure on the server
- ✅ Your website is more secure
- ✅ Consider adding rate limiting to API functions
- ✅ Consider adding authentication for admin operations
