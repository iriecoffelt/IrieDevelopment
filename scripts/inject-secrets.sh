#!/bin/bash
# Script to inject GitHub secrets into files during build
# This script is used by GitHub Actions workflow

set -e  # Exit on error

echo "🔐 Injecting secrets into files..."

# Check if running in GitHub Actions
if [ -z "$GITHUB_ACTIONS" ]; then
    echo "⚠️  Warning: Not running in GitHub Actions"
    echo "This script is designed for GitHub Actions workflows"
fi

# File to modify
NEWSLETTER_JS="newsletter.js"

# Check if file exists
if [ ! -f "$NEWSLETTER_JS" ]; then
    echo "❌ Error: $NEWSLETTER_JS not found"
    exit 1
fi

# Backup original file
cp "$NEWSLETTER_JS" "${NEWSLETTER_JS}.backup"
echo "✅ Created backup: ${NEWSLETTER_JS}.backup"

# Replace placeholders with secrets (if provided)
# Note: These environment variables should be set by GitHub Actions

if [ -n "$EMAILJS_USER_ID" ]; then
    sed -i.bak "s|{{EMAILJS_USER_ID}}|$EMAILJS_USER_ID|g" "$NEWSLETTER_JS"
    echo "✅ Injected EMAILJS_USER_ID"
fi

if [ -n "$EMAILJS_SERVICE_ID" ]; then
    sed -i.bak "s|{{EMAILJS_SERVICE_ID}}|$EMAILJS_SERVICE_ID|g" "$NEWSLETTER_JS"
    echo "✅ Injected EMAILJS_SERVICE_ID"
fi

if [ -n "$EMAILJS_TEMPLATE_ID" ]; then
    sed -i.bak "s|{{EMAILJS_TEMPLATE_ID}}|$EMAILJS_TEMPLATE_ID|g" "$NEWSLETTER_JS"
    echo "✅ Injected EMAILJS_TEMPLATE_ID"
fi

if [ -n "$JSONBIN_ACCESS_KEY" ]; then
    sed -i.bak "s|{{JSONBIN_ACCESS_KEY}}|$JSONBIN_ACCESS_KEY|g" "$NEWSLETTER_JS"
    echo "✅ Injected JSONBIN_ACCESS_KEY"
fi

if [ -n "$JSONBIN_BIN_ID" ]; then
    sed -i.bak "s|{{JSONBIN_BIN_ID}}|$JSONBIN_BIN_ID|g" "$NEWSLETTER_JS"
    echo "✅ Injected JSONBIN_BIN_ID"
fi

# Clean up backup files created by sed
rm -f "${NEWSLETTER_JS}.bak"

echo "✅ Secret injection complete!"
echo "📝 Modified file: $NEWSLETTER_JS"
