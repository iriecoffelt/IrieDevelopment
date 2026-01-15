# GitHub Secrets Quick Start Guide

## TL;DR - Can I Use GitHub Secrets in My Website?

**Short Answer**: Yes, but only during build/deployment via GitHub Actions workflows. Secrets are **NOT** accessible in browser JavaScript.

## Quick Setup (3 Steps)

### 1. Add Secrets to GitHub
Go to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:
- `EMAILJS_USER_ID`
- `EMAILJS_SERVICE_ID`  
- `EMAILJS_TEMPLATE_ID`
- `JSONBIN_ACCESS_KEY`
- `JSONBIN_BIN_ID`

### 2. Use Secrets in Workflow
The workflow file `.github/workflows/deploy.yml` is already set up. It will:
- ✅ Access secrets using `${{ secrets.SECRET_NAME }}`
- ✅ Inject them into files during build
- ✅ Deploy your site

### 3. Deploy
Push to `main` branch → Workflow runs → Secrets injected → Site deployed

## How It Works

```
┌─────────────────┐
│  GitHub Repo    │
│  (with secrets) │
└────────┬────────┘
         │
         │ Push to main
         ▼
┌─────────────────────────┐
│  GitHub Actions         │
│  Workflow Runs          │
│  Uses secrets           │
│  Injects into files     │
└────────┬────────────────┘
         │
         │ Deploy
         ▼
┌─────────────────────────┐
│  Deployed Website       │
│  (with secrets injected)│
└─────────────────────────┘
```

## Important Notes

### ✅ What Works
- Using secrets in GitHub Actions workflows
- Injecting secrets during build
- Keeping secrets out of your repository
- Automatic secret masking in logs

### ❌ What Doesn't Work
- Accessing secrets directly in browser JavaScript
- Using secrets in static HTML files
- Reading secrets from client-side code

## Current Status

Your `newsletter.js` currently has **hardcoded values**:
- EmailJS values (public keys) - ✅ Safe to expose
- JSONBin Access Key - ⚠️ Should be kept secret

## Options

### Option A: Keep Current Setup (Simplest)
- EmailJS values stay hardcoded (they're public keys)
- Works fine for now
- No changes needed

### Option B: Use GitHub Secrets (More Secure)
- Move JSONBin key to GitHub Secrets
- Use workflow to inject during build
- More secure, but requires workflow setup

### Option C: Use Serverless Functions (Most Secure)
- Create API endpoints with secrets
- Call APIs from frontend
- Secrets never reach browser

## Example: Using Secrets

In your workflow file:
```yaml
- name: Use secret
  run: |
    echo "Secret: ${{ secrets.MY_SECRET }}"
    # Secret is automatically masked in logs
```

## Need Help?

- 📖 Full guide: `GITHUB_SECRETS_SETUP.md`
- 🔧 Workflow file: `.github/workflows/deploy.yml`
- 📝 Script: `scripts/inject-secrets.sh`

## Security Best Practices

1. ✅ Use secrets for sensitive data (API keys, tokens)
2. ✅ Use variables for non-sensitive config
3. ✅ Never commit secrets to repository
4. ✅ Use public keys in client-side code when possible
5. ✅ Consider serverless functions for true security
