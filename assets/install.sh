#!/bin/sh
set -e

# Resolve actual script path even when called via init.d symlink
_SELF="$(readlink -f "$0" 2>/dev/null || echo "$0")"
APP_DIR="$(dirname "$(dirname "$_SELF")")"

SCREENSAVER_BASE="/usr/palm/applications/com.webos.app.screensaver"
CLOCK_TARGET="$SCREENSAVER_BASE/qml/UserInterfaceLayer/Containers/Clock.qml"
MAIN_TARGET="$SCREENSAVER_BASE/qml/main.qml"
INIT_LINK="/var/lib/webosbrew/init.d/50-idlegif"
GIF_DIR="/var/lib/webosbrew/idlegif"

mkdir -p "$GIF_DIR"

# webOS 9.x (2022+ OLEDs): deep hierarchy with Clock.qml
# webOS 5/6 (2020/2021): simple structure with main.qml as entry point
if [ -f "$CLOCK_TARGET" ]; then
    MOUNT_TARGET="$CLOCK_TARGET"
    QML_PATH="$APP_DIR/assets/Clock.qml"
elif [ -f "$MAIN_TARGET" ]; then
    MOUNT_TARGET="$MAIN_TARGET"
    QML_PATH="$APP_DIR/assets/screensaver.qml"
else
    echo "[-] No supported screensaver target found" >&2
    exit 1
fi

umount "$MOUNT_TARGET" 2>/dev/null || true
mount --bind "$QML_PATH" "$MOUNT_TARGET"
echo "[+] Screensaver override applied: $QML_PATH -> $MOUNT_TARGET" >&2

if [ ! -L "$INIT_LINK" ]; then
    ln -sf "$_SELF" "$INIT_LINK"
    echo "[+] Boot hook installed: $INIT_LINK" >&2
else
    echo "[~] Boot hook already present." >&2
fi
