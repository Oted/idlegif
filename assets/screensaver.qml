// idlegif: bind-mount override for webOS 5/6 (main.qml path)
// Self-contained — no parent context dependencies.

import QtQuick 2.4

Item {
    width: 1920
    height: 1080

    Rectangle {
        anchors.fill: parent
        color: "black"
    }

    AnimatedImage {
        anchors.fill: parent
        source: "/var/lib/webosbrew/idlegif/screensaver.gif"
        fillMode: Image.PreserveAspectCrop
        smooth: false
        playing: true
    }
}
