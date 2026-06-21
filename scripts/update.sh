#!/usr/bin/env bash
# Omakase update script
# Usage: curl -fsSL https://raw.githubusercontent.com/miruamel/omakase/main/scripts/update.sh | bash

set -e

REPO="miruamel/omakase"
BINARY_NAME="omakase"
INSTALL_DIR="${OMAKASE_INSTALL_DIR:-/usr/local/bin}"

# Check current version
if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
    CURRENT_VERSION=$("$INSTALL_DIR/$BINARY_NAME" --version 2>/dev/null || echo "unknown")
    echo "Current version: $CURRENT_VERSION"
else
    echo "Omakase not installed"
    exit 1
fi

# Get latest version
echo "Fetching latest version..."
LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
    echo "Failed to fetch latest version"
    exit 1
fi

echo "Latest version: v$LATEST_VERSION"

# Compare versions
if [ "$CURRENT_VERSION" = "$LATEST_VERSION" ]; then
    echo "Already on latest version"
    exit 0
fi

# Download URL
DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$LATEST_VERSION/$BINARY_NAME"

# Download binary
echo "Downloading from $DOWNLOAD_URL..."
TMP_FILE=$(mktemp)
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_FILE"

# Make executable
chmod +x "$TMP_FILE"

# Replace existing binary
if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
else
    sudo mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
fi

echo "Updated to v$LATEST_VERSION"
