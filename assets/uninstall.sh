#!/bin/sh

SCREENSAVER_BASE="/usr/palm/applications/com.webos.app.screensaver"
CLOCK_TARGET="$SCREENSAVER_BASE/qml/UserInterfaceLayer/Containers/Clock.qml"
MAIN_TARGET="$SCREENSAVER_BASE/qml/main.qml"
INIT_LINK="/var/lib/webosbrew/init.d/50-idlegif"

REMOVED=0
for target in "$CLOCK_TARGET" "$MAIN_TARGET"; do
    if umount "$target" 2>/dev/null; then
        echo "Screensaver override removed ($target)."
        REMOVED=1
        break
    fi
done

if [ "$REMOVED" -eq 0 ]; then
    echo "No active screensaver override found."
fi

if [ -L "$INIT_LINK" ]; then
    rm "$INIT_LINK"
    echo "Boot hook removed."
else
    echo "No boot hook found."
fi
