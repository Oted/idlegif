#!/bin/sh
set -e

# Resolve actual script path even when called via init.d symlink
_SELF="$(readlink -f "$0" 2>/dev/null || echo "$0")"
APP_DIR="$(dirname "$(dirname "$_SELF")")"

MOUNT_TARGET="/usr/palm/applications/com.webos.app.screensaver/qml/UserInterfaceLayer/Containers/Clock.qml"
QML_PATH="$APP_DIR/assets/Clock.qml"
INIT_LINK="/var/lib/webosbrew/init.d/50-idlegif"
GIF_DIR="/var/lib/webosbrew/idlegif"

mkdir -p "$GIF_DIR"

if [ ! -f "$MOUNT_TARGET" ]; then
    echo "[-] Mount target does not exist: $MOUNT_TARGET" >&2
    exit 1
fi

umount "$MOUNT_TARGET" 2>/dev/null || true
mount --bind "$QML_PATH" "$MOUNT_TARGET"
echo "[+] Screensaver override applied: $QML_PATH" >&2

if [ ! -L "$INIT_LINK" ]; then
    ln -sf "$_SELF" "$INIT_LINK"
    echo "[+] Boot hook installed: $INIT_LINK" >&2
else
    echo "[~] Boot hook already present." >&2
fi
