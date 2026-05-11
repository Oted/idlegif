#!/bin/sh
set -o pipefail

MOUNT_TARGET="/usr/palm/applications/com.webos.app.screensaver/qml/UserInterfaceLayer/Containers/Clock.qml"
INIT_LINK="/var/lib/webosbrew/init.d/50-idlegif"

if findmnt "$MOUNT_TARGET" > /dev/null 2>&1; then
    umount "$MOUNT_TARGET"
    echo "[+] Screensaver override removed." >&2
else
    echo "[~] No active bind-mount found." >&2
fi

if [ -L "$INIT_LINK" ]; then
    rm "$INIT_LINK"
    echo "[+] Boot hook removed: $INIT_LINK" >&2
else
    echo "[~] No boot hook found." >&2
fi
