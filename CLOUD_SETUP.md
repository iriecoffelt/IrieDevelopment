# Cloud Subscriber Count Setup

## Overview
The subscriber count now fetches from cloud storage, ensuring it's the same across all devices and browsers.

## Setup Options

### Option 1: JSONBin.io (Recommended - Free & Easy)

1. **Get a free JSONBin.io account:**
   - Go to https://jsonbin.io/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Update newsletter.js:**
   - Open `newsletter.js`
   - Find the line: `this.jsonBinApiKey = 'YOUR_JSONBIN_API_KEY';`
   - Replace `YOUR_JSONBIN_API_KEY` with your actual API key

3. **How it works:**
   - First subscriber signup will automatically create a JSONBin
   - All subsequent reads/writes will use that bin
   - The bin ID is saved in localStorage for future use

### Option 2: GitHub Raw Content (Free, No API Key Needed)

1. **Update the GitHub URL in newsletter.js:**
   - Find: `this.githubRawUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/subscribers.json';`
   - Replace with your actual GitHub username and repository name

2. **How it works:**
   - Reads from your GitHub repository's `data/subscribers.json` file
   - No authentication needed for public repos
   - To update: manually edit the file on GitHub or use your admin panel

### Option 3: Your Own Domain (Current Setup)

The system will also try to fetch from `/data/subscribers.json` on your website as a fallback.

## How It Works

1. **Reading:** The system tries to fetch from cloud sources in this order:
   - JSONBin.io (if configured)
   - GitHub raw content (if configured)
   - Local data file (`/data/subscribers.json`)
   - localStorage (final fallback)

2. **Writing:** When a new subscriber signs up:
   - Saves to JSONBin.io (if API key is configured)
   - Saves to localStorage (always, as backup)
   - Sends to EmailJS (for notifications)

## Benefits

✅ Subscriber count is the same everywhere  
✅ No browser-specific storage  
✅ Automatic cloud sync  
✅ Free to use  
✅ Fallback mechanisms ensure it always works  

## Testing

1. Open your website
2. Check the browser console - you should see:
   - "Loading subscribers from cloud storage..."
   - "✅ Loaded subscribers from cloud: X subscribers"
3. The subscriber count should display the cloud count

## Troubleshooting

**Count shows 0:**
- Check browser console for errors
- Verify your JSONBin API key is correct (if using Option 1)
- Verify your GitHub URL is correct (if using Option 2)
- Check that `data/subscribers.json` exists and is accessible

**Count not updating:**
- Make sure JSONBin API key is set (for write access)
- Check browser console for error messages
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
