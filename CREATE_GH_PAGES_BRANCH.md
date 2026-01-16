# Create gh-pages Branch Manually

## Problem
The workflow can't CREATE the `gh-pages` branch due to repository rules, even though updates might be allowed.

## Solution: Create Branch Manually

Since you can't edit the ruleset to allow creation, create the branch manually first. Once it exists, the workflow can update it.

### Step 1: Create the Branch Locally

Run these commands in your terminal:

```bash
# Navigate to your repository
cd "/Volumes/I.C.T9 4TB/Documents/Websites/IrieDevelopment"

# Create an orphan branch (no parent)
git checkout --orphan gh-pages

# Remove all files from staging
git rm -rf .

# Create a simple placeholder file
echo "# GitHub Pages" > index.html

# Stage and commit
git add index.html
git commit -m "Initial gh-pages branch for GitHub Pages"

# Push to GitHub
git push origin gh-pages

# Switch back to main branch
git checkout main
```

### Step 2: Verify Branch Was Created

```bash
# Check if branch exists
git branch -a | grep gh-pages

# Should show: remotes/origin/gh-pages
```

### Step 3: Re-run Workflow

After creating the branch:
1. Go to Actions tab
2. Click on the failed workflow
3. Click "Re-run all jobs"

The workflow should now be able to UPDATE the `gh-pages` branch (even if it couldn't create it).

## Alternative: Use GitHub Web Interface

If command line doesn't work:

1. Go to: https://github.com/iriecoffelt/IrieDevelopment
2. Click the branch dropdown (says "main")
3. Type "gh-pages" in the search box
4. If it doesn't exist, you'll see "Create branch: gh-pages from 'main'"
5. Click it to create the branch
6. Then delete all files and add a simple `index.html`
7. Commit the changes

## Why This Works

- **Creating** a branch requires bypass permissions
- **Updating** an existing branch might be allowed even with restrictions
- Once the branch exists, the workflow can push updates to it

## After Creating the Branch

Your workflow should work! The `peaceiris/actions-gh-pages@v3` action will:
1. Checkout the existing `gh-pages` branch
2. Update it with your website files
3. Push the updates successfully
