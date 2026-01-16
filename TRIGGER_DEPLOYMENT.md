# Trigger Deployment

## Current Status

- ✅ Local `main` branch: Has `newsletter-serverless.js`
- ✅ `gh-pages` branch: Has `newsletter-serverless.js`
- ❌ Live site: Still showing `newsletter.js` (cached/old version)

## The Problem

GitHub Pages is serving an old cached version. The `gh-pages` branch has the correct code, but GitHub Pages hasn't updated yet.

## Solutions

### Option 1: Force GitHub Pages Rebuild (Recommended)

1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/pages
2. Click **"Save"** button (even if nothing changed)
3. This forces GitHub Pages to rebuild from `gh-pages` branch
4. Wait 2-5 minutes
5. Test: `curl https://www.irie-development.com/index.html | grep newsletter`

### Option 2: Trigger Workflow Manually

1. Go to: https://github.com/iriecoffelt/IrieDevelopment/actions
2. Click on "Deploy Website" workflow
3. Click "Run workflow" button
4. Select `main` branch
5. Click "Run workflow"
6. Wait for workflow to complete (2-3 minutes)
7. Wait 2-5 minutes for GitHub Pages to rebuild

### Option 3: Make a Small Change to Trigger

```bash
# Make a small change to trigger workflow
echo "<!-- Deployment trigger -->" >> index.html
git add index.html
git commit -m "Trigger deployment"
git push origin main
```

Then wait for workflow to complete and GitHub Pages to rebuild.

## Verify Deployment

After triggering, check:

```bash
# Should show newsletter-serverless.js
curl https://www.irie-development.com/index.html | grep newsletter

# Should return JavaScript (not 404)
curl https://www.irie-development.com/env-config.js
```

## Expected Result

After deployment:

- ✅ `index.html` loads `newsletter-serverless.js` (not `newsletter.js`)
- ✅ `env-config.js` loads without 404
- ✅ No subscriber loading on homepage
- ✅ Subscribers only load on admin pages
