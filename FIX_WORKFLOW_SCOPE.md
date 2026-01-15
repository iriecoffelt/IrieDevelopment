# Fix: Workflow Scope Required Error

## Problem
GitHub is blocking your push because your Personal Access Token doesn't have the `workflow` scope, which is required to modify workflow files in `.github/workflows/`.

## Solution: Add Workflow Scope to Your Token

### Step 1: Go to GitHub Token Settings
1. Go to: https://github.com/settings/tokens
2. Find your token (or create a new one)

### Step 2: Edit Your Token
1. Click **"Edit"** or **"Generate new token (classic)"**
2. Scroll down to **"Select scopes"**
3. Check the box for **`workflow`** scope
   - This allows the token to update GitHub Actions workflow files
4. Click **"Generate token"** or **"Update token"**
5. **Copy the new token** (you'll only see it once!)

### Step 3: Update Your Git Credentials

#### Option A: Update in Your Git Client (VS Code/Cursor)
1. When you push, it will prompt for credentials
2. Use your GitHub username
3. Use the **new token** (not your password) as the password

#### Option B: Update Git Credential Helper
```bash
# Remove old credentials
git credential-osxkeychain erase
host=github.com
protocol=https

# Next push will prompt for new credentials
```

#### Option C: Use SSH Instead (Alternative)
If you prefer SSH:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Change remote URL: `git remote set-url origin git@github.com:iriecoffelt/IrieDevelopment.git`

## Quick Fix: Generate New Token with Workflow Scope

1. **Go to**: https://github.com/settings/tokens/new
2. **Name**: "Irie Development Workflows"
3. **Expiration**: Choose your preference
4. **Scopes**: Check these boxes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows) ← **IMPORTANT**
5. **Generate token**
6. **Copy the token** immediately
7. **Update your Git credentials** with the new token

## After Updating Token

Try pushing again:
```bash
git push origin main
```

It should work now! ✅

## Why This Happens

GitHub has security rules that require the `workflow` scope to modify workflow files. This prevents unauthorized changes to your CI/CD pipelines.

## Alternative: Disable Workflow Protection (Not Recommended)

If you're the repository owner, you can temporarily disable this protection:
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/rules
2. Find the rule blocking workflow changes
3. Temporarily disable it
4. Push your changes
5. Re-enable the rule

**Note**: This is less secure. Adding the `workflow` scope is the recommended approach.
