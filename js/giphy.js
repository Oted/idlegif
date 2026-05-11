// GiphyClient — model: API key storage and GIF search

var QUERIES = [
    // Cinemagraph — photo with single animated element, perfect screensaver format
    "cinemagraph loop",
    "cinemagraph nature loop",
    "cinemagraph rain loop",
    "cinemagraph forest loop",
    "cinemagraph coffee steam loop",
    "cinemagraph candle loop",
    "cinemagraph waterfall loop",

    // Slow / ink / fluid — very slow, hypnotic
    "ink water loop",
    "slow motion water loop",
    "lava lamp loop",
    "sacred geometry loop",
    "mandala loop",

    // Nature / atmospheric
    "ocean waves loop",
    "slow motion rain loop",
    "fog forest loop",
    "snow falling night loop",
    "waterfall loop",
    "time lapse clouds loop",

    // Space / cosmic
    "nebula space loop",
    "galaxy stars loop",
    "aurora borealis loop",
    "northern lights loop",
    "planet earth loop",

    // Underwater — jellyfish only, specific enough to stay on topic
    "jellyfish loop",
    "deep sea loop",

    // Cozy / ambient
    "fireplace loop",

    // Scenic / atmospheric cityscapes (no concerts/people)
    "synthwave landscape loop",
    "city skyline night loop",

    // Pixel art (kept — reliable quality)
    "pixel art landscape night loop",
    "pixel art space stars loop",
    "pixel art campfire loop",
    "lofi pixel art loop",
];

function GiphyClient() {}

GiphyClient.prototype.getApiKey = function() {
    return localStorage.getItem("giphyApiKey") || "";
};

GiphyClient.prototype.saveApiKey = function(key) {
    localStorage.setItem("giphyApiKey", key.trim());
};

GiphyClient.prototype._fetch = function() {
    var key    = this.getApiKey();
    var query  = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    var offset = Math.floor(Math.random() * 100);
    var url    = "https://api.giphy.com/v1/gifs/search"
        + "?api_key=" + encodeURIComponent(key)
        + "&q="       + encodeURIComponent(query)
        + "&limit=50&rating=g&offset=" + offset;

    return fetch(url)
        .then(function(r) {
            if (!r.ok) throw "GIPHY API error: " + r.status;
            return r.json();
        })
        .then(function(data) {
            var results = [];
            for (var i = 0; i < data.data.length; i++) {
                var g      = data.data[i];
                var orig   = g.images.original;
                var w      = parseInt(orig.width  || 0);
                var h      = parseInt(orig.height || 0);
                var kb     = parseInt(orig.size   || 0) / 1024;
                var frames = parseInt(orig.frames || 0);
                // frames filter only applied when the field is present (not all GIPHY responses include it)
                if (w < 400 || h > w || kb < 100 || (frames > 0 && frames < 10)) continue;
                results.push({
                    id:         g.id,
                    title:      g.title,
                    w:          w,
                    h:          h,
                    kb:         Math.round(kb),
                    previewUrl: g.images.fixed_height.url,
                    gifUrl:     orig.url || g.images.downsized_large.url,
                });
                if (results.length >= 4) break;
            }
            return results;
        });
};

GiphyClient.prototype.fetchGifs = function() {
    if (!this.getApiKey()) return Promise.reject("No API key set");
    var self = this;
    // Retry once with a fresh query if the first attempt yields nothing after filtering
    return self._fetch().then(function(gifs) {
        return gifs.length ? gifs : self._fetch();
    });
};
