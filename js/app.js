// App — controller: orchestrates WebOSService, GiphyClient and View

function App() {
    this.webos  = new WebOSService();
    this.giphy  = new GiphyClient();
    this.view   = new View();
    this._activeGifId = null;

    this._wireCallbacks();
}

App.prototype._wireCallbacks = function() {
    var self = this;

    this.view.onApiKeySave(function(key) {
        self.giphy.saveApiKey(key);
        self.loadGifs();
    });

    this.view.onApiKeyClear(function() {
        self.giphy.saveApiKey("");
        self.view.renderGiphyGrid(DEFAULTS, self._activeGifId, false);
        self.view.setStatus("");
    });

    this.view.onRefresh(function() {
        self.loadGifs();
    });

    this.view.onGifSelect(function(gif) {
        self.selectGif(gif);
    });

    this.view.onUrlDownload(function(url) {
        self.downloadUrl(url);
    });

    this.view.onTest(function() {
        self.view.setStatus("Triggering screensaver…");
        self.webos.testScreensaver()
            .then(function()  { self.view.setStatus("Screensaver triggered.", "ok"); })
            .catch(function(e){ self.view.setStatus("Error: " + e, "err"); });
    });

    this.view.onUninstall(function() {
        self.view.setStatus("Uninstalling…");
        self.webos.uninstall()
            .then(function(out){ self.view.setStatus(out.trim() || "Uninstalled.", "ok"); })
            .catch(function(e) { self.view.setStatus("Error: " + e, "err"); });
    });
};

App.prototype.init = function() {
    var hasKey = !!this.giphy.getApiKey();
    this.view.renderGiphyGrid(DEFAULTS, this._activeGifId, hasKey);
    if (hasKey) {
        this.loadGifs();
    }
};

App.prototype.loadGifs = function() {
    var self = this;
    var hasKey = !!this.giphy.getApiKey();
    this.view.setStatus("Loading…");
    this.view.setLoading(true);

    this.giphy.fetchGifs()
        .then(function(gifs) {
            self.view.renderGiphyGrid(gifs, self._activeGifId, hasKey);
            self.view.setStatus(gifs.length ? "" : "No results — try refreshing.", gifs.length ? "" : "err");
        })
        .catch(function(err) { self.view.setStatus("Error: " + err, "err"); })
        .finally(function()  { self.view.setLoading(false); });
};

App.prototype.selectGif = function(gif) {
    var self = this;
    this.view.setStatus("Downloading and applying…");
    this.view.setLoading(true);

    this.webos.downloadAndApply(gif.gifUrl)
        .then(function() {
            self._activeGifId = gif.id;
            self.view.setActiveCard(gif.id);
            self.view.setStatus("Applied: " + gif.title, "ok");
        })
        .catch(function(err) { self.view.setStatus("Error: " + err, "err"); })
        .finally(function()  { self.view.setLoading(false); });
};

App.prototype.downloadUrl = function(url) {
    if (!url || !url.trim()) {
        this.view.setStatus("Please enter a GIF URL.", "err");
        return;
    }
    var self = this;
    this.view.setStatus("Downloading…");

    this.webos.downloadAndApply(url.trim())
        .then(function()  { self.view.setStatus("Applied.", "ok"); })
        .catch(function(e){ self.view.setStatus("Error: Filed to download, is the URL available?", "err"); });
};

window.addEventListener("DOMContentLoaded", function() {
    new App().init();
});
