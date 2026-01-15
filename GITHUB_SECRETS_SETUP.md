# GitHub Secrets & Variables Setup Guide

## Overview

GitHub Secrets and Variables can be used in **GitHub Actions workflows only**. They are **NOT** accessible in client-side JavaScript files that run in the browser.

## Understanding the Limitations

### ✅ What GitHub Secrets CAN Do:

- Use secrets in GitHub Actions workflows (server-side)
- Inject secrets during build/deployment
- Keep secrets out of your repository
- Automatically mask secrets in logs

### ❌ What GitHub Secrets CANNOT Do:

- Access secrets directly in browser JavaScript
- Use secrets in static HTML files
- Access secrets from client-side code

## Solution Options

### Option 1: Build-Time Secret Injection (Recommended)

Replace placeholders in your files during GitHub Actions build:

1. **Add placeholders to your JavaScript files**
2. **Use GitHub Actions to replace them with secrets**
3. **Deploy the modified files**

### Option 2: Use Public Keys Only

Some services (like EmailJS) use public keys that are safe to expose:

- EmailJS User ID (public key) - ✅ Safe to expose
- EmailJS Service ID - ✅ Safe to expose
- EmailJS Template ID - ✅ Safe to expose
- JSONBin Access Key - ⚠️ Should be kept secret

### Option 3: Serverless Functions/API

Create API endpoints that use secrets server-side:

- Keep secrets in GitHub Actions or serverless functions
- Call APIs from your frontend
- Secrets never reach the browser

## Setup Instructions

### Step 1: Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
EMAILJS_USER_ID = zRYVGu1o6DDmrdc4f
EMAILJS_SERVICE_ID = service_ju06a1p
EMAILJS_TEMPLATE_ID = template_925ze9i
JSONBIN_ACCESS_KEY = $2a$10$.tte9gaAB5LnvRsH2dUz4OFuloHrp3GWDQsCdpRmgcfZ3uf4TYbsq
JSONBIN_BIN_ID = 6967037143b1c97be92f1730
```

### Step 2: Update Your Workflow

The workflow file (`.github/workflows/deploy.yml`) will automatically:

- Replace placeholders with secrets during build
- Deploy the modified files
- Keep secrets out of your repository

### Step 3: Update newsletter.js (Optional)

If you want to use placeholders, update your `newsletter.js`:

```javascript
// Replace hardcoded values with placeholders
this.serviceId = "{{EMAILJS_SERVICE_ID}}";
this.templateId = "{{EMAILJS_TEMPLATE_ID}}";
this.userId = "{{EMAILJS_USER_ID}}";
this.jsonBinAccessKey = "{{JSONBIN_ACCESS_KEY}}";
this.jsonBinBinId = "{{JSONBIN_BIN_ID}}";
```

The workflow will replace these during deployment.

## Current Status

Your current setup uses **hardcoded values** in `newsletter.js`. This works, but:

- ✅ **EmailJS values are public keys** - Safe to expose
- ⚠️ **JSONBin Access Key** - Should ideally be kept secret

## Best Practices

### For Public Keys (Safe to Expose)

- EmailJS User ID, Service ID, Template ID
- These can stay in your JavaScript files
- No security risk

### For Private Keys (Keep Secret)

- JSONBin Access Key
- API keys with write permissions
- Authentication tokens

### Recommended Approach

1. **Keep EmailJS values as-is** (they're public keys)
2. **Move JSONBin Access Key to GitHub Secrets**
3. **Use GitHub Actions to inject it during build**
4. **Or use a serverless function** to proxy JSONBin requests

## Example: Using Secrets in Workflow

```yaml
- name: Inject secrets
  run: |
    sed -i "s|{{JSONBIN_ACCESS_KEY}}|${{ secrets.JSONBIN_ACCESS_KEY }}|g" newsletter.js
```

## Security Notes

- 🔒 Secrets are automatically masked in GitHub Actions logs
- 🔒 Secrets are never exposed in the repository
- 🔒 Secrets are only available during workflow execution
- ⚠️ Once injected into files and deployed, they become visible in the deployed files
- 💡 For true security, use serverless functions/APIs

## Next Steps

1. ✅ Review the workflow file: `.github/workflows/deploy.yml`
2. ✅ Add secrets to your GitHub repository
3. ✅ Test the workflow by pushing to main branch
4. ✅ Verify deployment works correctly

## Troubleshooting

### Secrets not working?

- Make sure secrets are added in the correct repository
- Check that workflow has `permissions` set correctly
- Verify secret names match exactly (case-sensitive)

### Secrets visible in deployed files?

- This is expected if injecting during build
- Consider using serverless functions for true security
- Or use public keys only for client-side code

### Need help?

- Check GitHub Actions logs for errors
- Verify secret names match workflow references
- Ensure workflow has necessary permissions
