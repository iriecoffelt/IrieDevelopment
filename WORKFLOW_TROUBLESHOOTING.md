# GitHub Actions Workflow Troubleshooting

## Stuck Workflow - Cannot Cancel

### Error Message
```
Could not cancel workflow: 'Cannot cancel a workflow re-run that has not yet queued.'
```

### What This Means
This happens when:
- A workflow re-run is in a "queued" state but hasn't actually started
- GitHub's API can't cancel workflows in this transitional state
- The workflow is waiting for a runner but hasn't been assigned one yet

## Solutions

### Solution 1: Wait and Cancel (Easiest) ⏱️

1. **Wait 1-2 minutes** for the workflow to start running
2. Once it shows "In progress" or starts executing steps
3. Click **"Cancel workflow"** button again
4. It should cancel successfully

**Why this works**: Once the workflow actually starts, it can be canceled.

### Solution 2: Let It Run ⚡

If it's not critical:
1. **Just let it run** - it will complete or fail naturally
2. Most workflows finish quickly
3. No harm done if it completes

**When to use**: If the workflow is safe to run and won't cause issues.

### Solution 3: Use GitHub CLI (Advanced) 🔧

If you have GitHub CLI installed:

```bash
# List workflow runs
gh run list

# Cancel a specific run (replace RUN_ID with actual ID)
gh run cancel RUN_ID

# Or cancel all queued runs
gh run cancel --all
```

### Solution 4: Skip via New Commit 🚀

1. Make a small change (add a comment to a file)
2. Commit and push
3. The new workflow run will proceed
4. The stuck one will eventually timeout or be replaced

### Solution 5: Disable Workflow Temporarily 🛑

1. Go to **Actions** tab
2. Click on the workflow name (e.g., "Deploy Website")
3. Click **"..."** (three dots) → **"Disable workflow"**
4. Wait a few minutes
5. Re-enable the workflow
6. The stuck run should clear

## Prevention

### Add Timeout to Workflows

Add this to your workflow to prevent long-running workflows:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15  # Auto-cancel after 15 minutes
    steps:
      # ... your steps
```

### Add Concurrency Control

Prevent multiple runs at once:

```yaml
on:
  push:
    branches:
      - main

# Add this to prevent concurrent runs
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    # ... rest of workflow
```

## Quick Fix for Your Workflow

I can update your `.github/workflows/deploy.yml` to include:
- Timeout protection
- Concurrency control
- Better error handling

Would you like me to add these improvements?

## Still Stuck?

If none of these work:

1. **Wait 24 hours** - GitHub will auto-cancel stuck workflows
2. **Contact GitHub Support** - They can manually cancel it
3. **Check GitHub Status** - Sometimes it's a platform issue: https://www.githubstatus.com/

## Common Workflow Issues

### Workflow Runs Forever
- **Cause**: Infinite loop or hanging step
- **Fix**: Add `timeout-minutes` to job

### Multiple Workflows Running
- **Cause**: Multiple pushes/triggers
- **Fix**: Add `concurrency` control

### Workflow Fails Immediately
- **Cause**: Syntax error or missing secrets
- **Fix**: Check workflow logs for errors

### Can't Cancel Workflow
- **Cause**: Workflow in transitional state
- **Fix**: Wait for it to start, then cancel
