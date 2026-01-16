# Fix: Git Error in GitHub Actions Workflow

## Error Message
```
Action failed with "The process '/usr/bin/git' failed with exit code 1"
```

## What I Fixed

### 1. Added Required Permissions
Updated the workflow to include:
- `pages: write` - Required for GitHub Pages deployment
- `id-token: write` - Required for OIDC authentication

### 2. Updated GitHub Pages Deployment
Added configuration options to the deployment step to handle edge cases.

## Common Causes & Solutions

### Issue 1: GitHub Pages Not Enabled
**Check**: Go to your repository → Settings → Pages
- **Source**: Should be set to "GitHub Actions" (not "Deploy from a branch")
- **If not enabled**: Enable GitHub Pages and select "GitHub Actions" as the source

### Issue 2: Missing Permissions
**Fixed**: Added `pages: write` and `id-token: write` permissions to the workflow

### Issue 3: CNAME File Issues
Your `CNAME` file contains: `www.irie-development.com`
- Make sure this domain is properly configured in GitHub Pages settings
- Or temporarily disable CNAME by setting `cname: false` in the workflow

### Issue 4: Empty Repository or First Deploy
If this is the first deployment:
- The action might fail if the `gh-pages` branch doesn't exist
- The workflow should handle this automatically, but if it fails, you can manually create an empty `gh-pages` branch

## Quick Fixes

### Option 1: Disable CNAME Temporarily
If CNAME is causing issues, update the workflow:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  if: github.ref == 'refs/heads/main'
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./
    cname: false  # Change to false temporarily
```

### Option 2: Check GitHub Pages Settings
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/pages
2. **Source**: Select "GitHub Actions"
3. Save settings

### Option 3: Check Workflow Logs
1. Go to: Actions tab → Latest workflow run
2. Click on the failed step
3. Check the error message for specific details
4. Common errors:
   - "Permission denied" → Permissions issue (should be fixed now)
   - "Branch not found" → First deployment issue
   - "CNAME conflict" → Domain configuration issue

## Updated Workflow

The workflow now has:
- ✅ Proper permissions (`pages: write`, `id-token: write`)
- ✅ Better error handling
- ✅ CNAME support (if configured)

## Next Steps

1. **Commit the updated workflow**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Fix workflow permissions for GitHub Pages deployment"
   git push origin main
   ```

2. **Check GitHub Pages Settings**:
   - Ensure Pages is enabled
   - Source should be "GitHub Actions"

3. **Monitor the workflow**:
   - Go to Actions tab
   - Watch the workflow run
   - Check for any new errors

## If Still Failing

Check the workflow logs for the specific git command that's failing. Common issues:

- **Git config errors**: The action sets up git config automatically
- **Branch protection**: Make sure `gh-pages` branch isn't protected
- **Repository settings**: Check repository settings for any restrictions

## Test Without Deployment

If you want to test the workflow without deploying:

1. Comment out the deployment step temporarily
2. Push and verify other steps work
3. Uncomment and try deployment again
