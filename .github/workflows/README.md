# GitHub Actions Workflows

This directory contains GitHub Actions workflows that use GitHub Secrets and Variables.

## Available Secrets

To use these workflows, you need to add the following secrets to your GitHub repository:

### How to Add Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

#### Required Secrets

- `EMAILJS_USER_ID` - Your EmailJS user ID (public key)
- `EMAILJS_SERVICE_ID` - Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID` - Your EmailJS template ID
- `JSONBIN_ACCESS_KEY` - Your JSONBin.io access key
- `JSONBIN_BIN_ID` - Your JSONBin.io bin ID

#### Optional Secrets (for advanced features)

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `FTP_USER` - For FTP deployment (if using custom server)
- `FTP_PASSWORD` - For FTP deployment
- `FTP_HOST` - For FTP deployment

## Available Variables

You can also use GitHub Variables (less sensitive than secrets):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab
3. Add variables like:
   - `DEPLOYMENT_ENV` - e.g., "production" or "staging"
   - `API_BASE_URL` - Your API base URL
   - `SITE_NAME` - Your site name

## Usage in Workflows

Secrets are accessed using: `${{ secrets.SECRET_NAME }}`
Variables are accessed using: `${{ vars.VARIABLE_NAME }}`

## Important Security Notes

⚠️ **CRITICAL**: GitHub Secrets are:
- ✅ Available ONLY in GitHub Actions workflows
- ✅ Masked in logs (automatically hidden)
- ✅ NOT accessible in client-side JavaScript
- ✅ NOT accessible in browser console
- ✅ Only available during workflow execution

### For Client-Side Code

Since your website is static HTML/JS, secrets cannot be directly used in client-side code. Options:

1. **Use Environment Variables at Build Time** (Recommended)
   - Inject secrets during GitHub Actions build
   - Replace placeholders in your JS files
   - Deploy the modified files

2. **Use Serverless Functions**
   - Create API endpoints using GitHub Actions or serverless functions
   - Keep secrets server-side
   - Call APIs from your frontend

3. **Use Public Keys Only**
   - Some services (like EmailJS) use public keys that are safe to expose
   - Keep private keys server-side only

## Example: Using Secrets in Workflow

```yaml
- name: Use secret
  run: |
    echo "Secret value: ${{ secrets.MY_SECRET }}"
    # Secret is automatically masked in logs
```

## Example: Using Variables in Workflow

```yaml
- name: Use variable
  run: |
    echo "Environment: ${{ vars.DEPLOYMENT_ENV }}"
```

## Workflow Files

- `deploy.yml` - Main deployment workflow that uses secrets
