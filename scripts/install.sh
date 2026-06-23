#!/usr/bin/env bash
# Omakase installer script
# Usage: curl -fsSL https://raw.githubusercontent.com/miruamel/omakase/main/scripts/install.sh | bash

set -e

REPO="miruamel/omakase"
BINARY_NAME="omakase"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="macos";;
    *)          echo "Unsupported OS: $OS"; exit 1;;
esac

# Detect architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64)     ARCH_SUFFIX="x64";;
    aarch64|arm64) ARCH_SUFFIX="arm64";;
    *)          echo "Unsupported architecture: $ARCH"; exit 1;;
esac

# Get latest release version
echo "Fetching latest version..."
LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
    echo "Failed to fetch latest version"
    exit 1
fi

echo "Latest version: v$LATEST_VERSION"

# Download URL
DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$LATEST_VERSION/$BINARY_NAME"

# Download binary
echo "Downloading from $DOWNLOAD_URL..."
TMP_FILE=$(mktemp)
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_FILE"

# Ensure shebang is present (in case release asset is missing it)
if ! head -1 "$TMP_FILE" | grep -q "^#!"; then
    echo "Adding shebang to binary..."
    TMP_WITH_SHEBANG=$(mktemp)
    printf '#!/usr/bin/env node\n' > "$TMP_WITH_SHEBANG"
    cat "$TMP_FILE" >> "$TMP_WITH_SHEBANG"
    mv "$TMP_WITH_SHEBANG" "$TMP_FILE"
fi

# Make executable
chmod +x "$TMP_FILE"

# Install location
INSTALL_DIR="${OMAKASE_INSTALL_DIR:-/usr/local/bin}"

# Check if we have write permission
if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
    echo "Installed to $INSTALL_DIR/$BINARY_NAME"
else
    echo "Need sudo to install to $INSTALL_DIR"
    sudo mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
    echo "Installed to $INSTALL_DIR/$BINARY_NAME"
fi

# Verify installation
echo "Verifying installation..."
"$INSTALL_DIR/$BINARY_NAME" --version

echo ""
echo "Omakase v$LATEST_VERSION installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Set your API key: export ANTHROPIC_API_KEY=\"sk-ant-...\""
echo "  2. Run: omakase"
