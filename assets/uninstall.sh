#!/bin/sh

MOUNT_TARGET="/usr/palm/applications/com.webos.app.screensaver/qml/UserInterfaceLayer/Containers/Clock.qml"
INIT_LINK="/var/lib/webosbrew/init.d/50-idlegif"

if umount "$MOUNT_TARGET" 2>/dev/null; then
    echo "Screensaver override removed."
else
    echo "No active bind-mount found."
fi

if [ -L "$INIT_LINK" ]; then
    rm "$INIT_LINK"
    echo "Boot hook removed."
else
    echo "No boot hook found."
fi
