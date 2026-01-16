# Fix: GitHub Pages Serving Wrong Branch

## Problem

- `env-config.js` exists in `gh-pages` branch ✅
- Workflow deploys to `gh-pages` branch ✅
- But GitHub Pages returns 404 for `env-config.js` ❌

## Root Cause

GitHub Pages is configured to serve from the **`main`** branch instead of **`gh-pages`** branch.

## Solution: Update GitHub Pages Settings

### Step 1: Go to GitHub Pages Settings

1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/pages
2. Or: Repository → **Settings** → **Pages** (left sidebar)

### Step 2: Change Source Branch

**Current Setting (Wrong):**

- Source: `Deploy from a branch`
- Branch: `main` / `/ (root)`

**Change To (Correct):**

- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`

### Step 3: Save

Click **Save** button

### Step 4: Wait for Deployment

- GitHub Pages will rebuild from `gh-pages` branch
- Wait 1-2 minutes
- Visit: https://www.irie-development.com/env-config.js

## Alternative: Use GitHub Actions Source

If you prefer, you can also use:

- Source: **GitHub Actions** (instead of "Deploy from a branch")

This tells GitHub Pages to use whatever the workflow deploys, which is already `gh-pages`.

## Verify It Works

After changing the setting:

```bash
# Wait 1-2 minutes, then test:
curl https://www.irie-development.com/env-config.js

# Should return JavaScript, not HTML 404
```

## Current Status

✅ **Workflow**: Deploys to `gh-pages` branch correctly  
✅ **File exists**: `env-config.js` is in `gh-pages` branch  
❌ **GitHub Pages**: Serving from `main` branch (needs to be changed to `gh-pages`)
