#!/usr/bin/env bash
# Omakase uninstaller script
# Usage: curl -fsSL https://raw.githubusercontent.com/miruamel/omakase/main/scripts/uninstall.sh | bash

set -e

BINARY_NAME="omakase"
INSTALL_DIR="${OMAKASE_INSTALL_DIR:-/usr/local/bin}"

if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
    if [ -w "$INSTALL_DIR" ]; then
        rm "$INSTALL_DIR/$BINARY_NAME"
    else
        sudo rm "$INSTALL_DIR/$BINARY_NAME"
    fi
    echo "Omakase uninstalled from $INSTALL_DIR/$BINARY_NAME"
else
    echo "Omakase not found in $INSTALL_DIR"
fi
