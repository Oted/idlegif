// GiphyClient — model: API key storage and GIF search

var QUERIES = [
    "pixel art landscape night loop",
    "pixel art rain city loop",
    "pixel art forest loop",
    "pixel art ocean wave loop",
    "pixel art mountain loop",
    "pixel art space stars loop",
    "pixel art campfire loop",
    "pixel art snow loop",
    "pixel art cyberpunk night loop",
    "lofi pixel art loop",
    "pixel art sunset loop",
    "8bit landscape loop",
    "pixel art ambient loop",
];

function GiphyClient() {}

GiphyClient.prototype.getApiKey = function() {
    return localStorage.getItem("giphyApiKey") || "";
};

GiphyClient.prototype.saveApiKey = function(key) {
    localStorage.setItem("giphyApiKey", key.trim());
};

GiphyClient.prototype.fetchGifs = function() {
    var key = this.getApiKey();
    if (!key) return Promise.reject("No API key set");

    var query  = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    var offset = Math.floor(Math.random() * 40);
    var url    = "https://api.giphy.com/v1/gifs/search"
        + "?api_key=" + encodeURIComponent(key)
        + "&q="       + encodeURIComponent(query)
        + "&limit=25&rating=g&offset=" + offset;

    return fetch(url)
        .then(function(r) {
            if (!r.ok) throw "GIPHY API error: " + r.status;
            return r.json();
        })
        .then(function(data) {
            var results = [];
            for (var i = 0; i < data.data.length; i++) {
                var g    = data.data[i];
                var orig = g.images.original;
                var w    = parseInt(orig.width  || 0);
                var h    = parseInt(orig.height || 0);
                var kb   = parseInt(orig.size   || 0) / 1024;
                var frames = parseInt(orig.frames || 0);
                if (w < 400 || h > w || kb < 100 || frames < 10) continue;
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
