# Fix: Cannot Create gh-pages Branch

## Error Message
```
remote: error: GH013: Repository rule violations found for refs/heads/gh-pages.
remote: - Cannot create ref due to creations being restricted.
```

## Problem
Your repository has rules that prevent creating new branches. The GitHub Pages deployment needs to create/update the `gh-pages` branch.

## Solutions

### Solution 1: Update Repository Rules (Recommended) ✅

1. **Go to**: https://github.com/iriecoffelt/IrieDevelopment/rules
2. **Find the rule** that restricts branch creation
3. **Edit the rule**:
   - Look for "Branch creation" restrictions
   - Add `gh-pages` to the allowed branches, OR
   - Allow branch creation for workflows/GitHub Actions, OR
   - Temporarily disable branch creation restrictions
4. **Save** the changes

### Solution 2: Manually Create gh-pages Branch

If you can't modify repository rules, create the branch manually:

```bash
# Create an orphan branch (no history)
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Create a simple index.html
echo "<h1>GitHub Pages</h1>" > index.html

# Commit
git add index.html
git commit -m "Initial gh-pages branch"

# Push
git push origin gh-pages

# Switch back to main
git checkout main
```

### Solution 3: Allow Workflow to Create Branches

In your repository rules:
1. Go to **Settings** → **Rules** → **Rulesets**
2. Find the rule blocking branch creation
3. Add exception for:
   - **Actor**: `GITHUB_TOKEN` or `GitHub Actions`
   - **Bypass list**: Add `gh-pages` branch

### Solution 4: Use Different Deployment Method

If you can't modify rules, use a different deployment approach:

**Option A: Deploy to a different branch**
- Change the workflow to deploy to a branch that's allowed
- Update GitHub Pages to use that branch

**Option B: Use GitHub Pages from main branch**
- Deploy directly from `main` branch
- No need for `gh-pages` branch

## Quick Fix: Update Repository Rules

1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/rules
2. Click on the rule that's blocking branch creation
3. Look for "Branch creation" or "Branch protection" settings
4. Either:
   - **Allow** `gh-pages` branch creation
   - **Add exception** for GitHub Actions
   - **Temporarily disable** the restriction

## After Fixing

Once you've updated the rules:

1. **Re-run the workflow**:
   - Go to Actions tab
   - Click on the failed workflow
   - Click "Re-run all jobs"

2. **Or push a new commit**:
   ```bash
   git commit --allow-empty -m "Trigger workflow after fixing branch rules"
   git push origin main
   ```

## Verify It Works

After updating rules and re-running:
- Check Actions tab - workflow should succeed
- Check Pages tab - your site should deploy
- Visit your site URL to verify

## Alternative: Deploy from Main Branch

If you prefer not to use `gh-pages` branch, you can deploy directly from `main`:

1. Go to: **Settings** → **Pages**
2. **Source**: Select "Deploy from a branch"
3. **Branch**: Select `main` and `/ (root)`
4. **Save**

Then update the workflow to skip the deployment step (since Pages will deploy automatically from main).
