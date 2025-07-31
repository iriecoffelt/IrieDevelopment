# GitHub Newsletter System Setup

## Overview
This system now uses GitHub as a centralized storage for newsletter subscribers, ensuring the subscriber count is the same across all devices.

## How It Works
1. **Reading**: The system reads subscribers from `data/subscribers.json` in your GitHub repository
2. **Writing**: Subscribers are saved locally and synced to GitHub via the admin interface
3. **Fallback**: If GitHub is unavailable, it falls back to localStorage

## Setup Steps

### 1. Update Repository Name
In `newsletter.js`, update the repository name to match your actual GitHub repository:

```javascript
this.githubConfig = {
  repo: 'YOUR_USERNAME/YOUR_REPO_NAME', // Update this
  filePath: 'data/subscribers.json',
  branch: 'main'
};
```

### 2. Create GitHub Personal Access Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Irie Development Newsletter"
4. Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
5. Copy the token

### 3. Test the System
1. Open your website
2. Try subscribing with a test email
3. Go to the admin panel (`admin.html`)
4. Log in with your GitHub token
5. Go to "Send Newsletter" 
6. Click "🔄 Sync to GitHub" to push subscribers to GitHub

## Benefits
- ✅ Subscriber count is the same on all devices
- ✅ Centralized storage in GitHub
- ✅ Free to use
- ✅ Offline fallback to localStorage
- ✅ Admin can sync changes to GitHub

## Troubleshooting

### If subscribers aren't syncing:
1. Check that your GitHub token has the correct permissions
2. Verify the repository name in `newsletter.js`
3. Make sure the `data/subscribers.json` file exists in your repo

### If the count is still different:
1. Clear browser cache and localStorage
2. Refresh the page
3. The system will reload from GitHub

## File Structure
```
your-repo/
├── data/
│   └── subscribers.json    # Centralized subscriber storage
├── newsletter.js           # Updated with GitHub integration
├── send_newsletter.html    # Admin interface with sync button
└── index.html             # Main site
```

## Security Notes
- The `data/subscribers.json` file will be publicly readable
- Only email addresses are stored (no sensitive data)
- Admin access requires GitHub authentication
- Subscribers are also backed up in localStorage 