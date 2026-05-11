// idlegif: bind-mount override active — Option C: AnimatedImage (GIF) via Qt image subsystem

import QtQuick 2.12
import "../Components"

Item {

    id: root

    readonly property int displayDurationTime: 5000
    readonly property int mainFadeInOutTime: 3000
    readonly property int guideTextFadeInTime: 3000
    readonly property int infoFadeInOutTime: 500

    property int hours
    property int minutes
    property int seconds
    property string currentTime
    property real shift
    property bool isPartial: false
    property string guideString: ""
    property bool playing: false
    property bool timeUpdated: false
    property bool dataReady: playing && root.timeUpdated
    property alias animation: anim

    signal looped()

    onDataReadyChanged: {
        if (dataReady) {
            visible = true;
            anim.start();
        } else {
            visible = false;
            anim.stop();
        }
    }

    SequentialAnimation {
        id: anim
        loops: Animation.Infinite
        PauseAnimation { duration: 5 * 60 * 1000 }
        ScriptAction { script: looped() }
    }

    Rectangle {
        anchors.fill: parent
        color: "black"
    }

    AnimatedImage {
        anchors.fill: parent
        source: "/var/lib/webosbrew/idlegif/screensaver.gif"
        fillMode: Image.PreserveAspectCrop
        smooth: false
        playing: dataReady
    }

    Component.onCompleted: {
        updateTime();
        timeManager.currentTimeUpdated.connect(updateTime);
    }

    Component.onDestruction: {
        timeManager.currentTimeUpdated.disconnect(updateTime);
    }

    function updateTime() {
        if (!timeManager.isFactoryTime && timeManager.broadcastUtcTime) {
            currentTime = timeManager.dateTimeFormat(timeManager.broadcastUtcTime, "date", "dmy", "full");
            hours   = timeManager.broadcastUtcTime.getUTCHours() % 12;
            minutes = timeManager.broadcastUtcTime.getUTCMinutes() % 60;
            seconds = timeManager.broadcastUtcTime.getUTCSeconds() % 60;
        }
        timeUpdated = true;
    }
}
