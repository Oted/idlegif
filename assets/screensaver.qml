// idlegif: bind-mount override for webOS 5.x-8.x (main.qml path)
// Root must be WebOSWindow — this replaces main.qml which is the top-level window,
// not a component inside an existing hierarchy like Clock.qml is on webOS 9.x.

import QtQuick 2.4
import Eos.Window 0.1

WebOSWindow {
    id: window
    width: 1920
    height: 1080
    windowType: "_WEBOS_WINDOW_TYPE_SCREENSAVER"
    appId: "com.webos.app.screensaver"
    title: "Screen Saver"
    color: "black"
    visible: true

    AnimatedImage {
        anchors.fill: parent
        source: "/var/lib/webosbrew/idlegif/screensaver.gif"
        fillMode: Image.PreserveAspectCrop
        smooth: false
        playing: true
    }
}
