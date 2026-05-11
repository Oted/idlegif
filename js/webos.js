// WebOSService — platform adapter for webOS luna bus and shell exec via Homebrew Channel

// Derive install path from the page URL so this works regardless of install location
// (sideload: /media/developer/apps/..., store: /mnt/lg/appstore/...)
var APP_DIR = window.location.pathname.replace(/\/[^/]+$/, '');

function WebOSService() {}

WebOSService.prototype.luna = function(service, params) {
    return new Promise(function(resolve, reject) {
        if (typeof PalmServiceBridge === "undefined") {
            reject("PalmServiceBridge not available (not running on TV)");
            return;
        }
        var bridge = new PalmServiceBridge();
        bridge.onservicecallback = function(msg) {
            var r;
            try { r = JSON.parse(msg); } catch(e) { reject("Bad response: " + msg); return; }
            r.returnValue ? resolve(r) : reject(r.errorText || "Service call failed");
        };
        bridge.call(service, JSON.stringify(params || {}));
    });
};

WebOSService.prototype.exec = function(cmd) {
    return this.luna("luna://org.webosbrew.hbchannel.service/exec", { command: cmd })
        .then(function(r) { return r.stdoutString || ""; });
};

WebOSService.prototype.install = function() {
    return this.exec("sh " + APP_DIR + "/assets/install.sh");
};

WebOSService.prototype.uninstall = function() {
    return this.exec("sh " + APP_DIR + "/assets/uninstall.sh");
};

WebOSService.prototype.testScreensaver = function() {
    // Run entirely in hbchannel (root process) so it isn't affected by the app being suspended
    return this.exec(
        "luna-send -n 1 luna://com.webos.applicationManager/launch '{\"id\":\"com.webos.app.home\"}'" +
        " && sleep 3" +
        " && luna-send -n 1 luna://com.webos.service.tvpower/power/turnOnScreenSaver '{}'"
    );
};

WebOSService.prototype.downloadAndApply = function(gifUrl) {
    var dest = "/var/lib/webosbrew/idlegif/screensaver.gif";
    return this.exec('wget -q -O "' + dest + '" "' + gifUrl + '" && sh ' + APP_DIR + "/assets/install.sh");
};
