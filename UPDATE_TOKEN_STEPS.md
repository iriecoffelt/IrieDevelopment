# Step-by-Step: Update Your GitHub Token with Workflow Scope

## Current Issue
Your Personal Access Token doesn't have the `workflow` scope, which is required to push workflow files.

## Solution: Update Your Token

### Step 1: Create/Update Token on GitHub

1. **Go to**: https://github.com/settings/tokens/new
   - Or: GitHub.com → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)

2. **Token Settings**:
   - **Note**: "Irie Development - Workflows"
   - **Expiration**: Choose your preference (90 days, 1 year, or no expiration)
   - **Scopes**: Check these boxes:
     - ✅ **`repo`** - Full control of private repositories
     - ✅ **`workflow`** - Update GitHub Action workflows ⭐ **REQUIRED**
   
3. **Click**: "Generate token"

4. **IMPORTANT**: Copy the token immediately! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again
   - Save it somewhere safe temporarily

### Step 2: Clear Old Git Credentials (macOS)

Since you're on macOS, clear the old credentials:

```bash
# Clear stored GitHub credentials
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF
```

Or manually:
1. Open **Keychain Access** app (search Spotlight)
2. Search for "github.com"
3. Delete any entries related to GitHub
4. Or right-click → Delete

### Step 3: Push Again (Will Prompt for Credentials)

```bash
git push origin main
```

When prompted:
- **Username**: `iriecoffelt` (your GitHub username)
- **Password**: Paste the **new token** (the `ghp_...` string), NOT your GitHub password

### Step 4: Verify It Works

After entering the new token, the push should succeed! ✅

## Alternative: Use SSH (No Token Needed)

If you prefer not to use tokens:

### Setup SSH:

1. **Check if you have SSH key**:
   ```bash
   ls -la ~/.ssh/id_ed25519.pub
   # or
   ls -la ~/.ssh/id_rsa.pub
   ```

2. **If no key exists, generate one**:
   ```bash
   ssh-keygen -t ed25519 -C "iriecoffelt@gmail.com"
   # Press Enter to accept defaults
   ```

3. **Copy your public key**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the entire output
   ```

4. **Add to GitHub**:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "Mac - Irie Development"
   - Key: Paste your public key
   - Click "Add SSH key"

5. **Change remote URL to SSH**:
   ```bash
   git remote set-url origin git@github.com:iriecoffelt/IrieDevelopment.git
   ```

6. **Test SSH connection**:
   ```bash
   ssh -T git@github.com
   # Should say: "Hi iriecoffelt! You've successfully authenticated..."
   ```

7. **Push**:
   ```bash
   git push origin main
   ```

## Quick Command Reference

```bash
# Check current remote URL
git remote -v

# Clear credentials (macOS)
git credential-osxkeychain erase
# Then type:
# host=github.com
# protocol=https
# (Press Enter twice)

# Push (will prompt for new credentials)
git push origin main
```

## Still Having Issues?

1. **Verify token has workflow scope**:
   - Go to: https://github.com/settings/tokens
   - Check your token - it should show `workflow` in the scopes list

2. **Try SSH instead** (see Alternative section above)

3. **Check repository rules**:
   - Go to: https://github.com/iriecoffelt/IrieDevelopment/rules
   - See if there are any rules blocking workflow changes
   - You may need to temporarily adjust them

## Why This Happens

GitHub requires the `workflow` scope to modify workflow files as a security measure. This prevents unauthorized changes to your CI/CD pipelines.
