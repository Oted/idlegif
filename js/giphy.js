// GiphyClient — model: API key storage and GIF search

var QUERIES = [
    // Cinemagraph
    "cinemagraph rain loop",
    "cinemagraph waterfall loop",
    "cinemagraph ocean loop",
    "cinemagraph mountains loop",
    "cinemagraph forest loop",
    "cinemagraph snow loop",
    "cinemagraph lake loop",
    "cinemagraph starry night loop",
    "cinemagraph sunrise loop",

    // Space & cosmic
    "aurora borealis loop",
    "comet stars loop",
    "nebula space loop",
    "galaxy stars loop",
    "milky way stars loop",
    "planet earth loop",
    "black hole animation loop",

    // Atmospheric nature
    "ocean waves loop",
    "fog forest loop",
    "dark forest loop",
    "aerial forest loop",
    "storm clouds loop",
    "desert dunes loop",
    "mountain lake reflection loop",
    "autumn leaves falling loop",
    "rain on window loop",
    "ice cave loop",
    "bioluminescent ocean loop",
    "coral reef loop",
    "sacred geometry loop",

    // Urban & aesthetic
    "neon city rain loop",
    "neon reflections loop",
    "underground neon loop",
    "synthwave landscape loop",
    "outrun aesthetic loop",
    "vaporwave loop",

    // Art
    "impressionist landscape loop",
    "animated painting loop",
    "hand drawn animation loop",
    "ink animation loop",
    "watercolor nature loop",
    "studio ghibli loop",
    "anime scenery loop",

    // Lo-fi
    "lofi anime loop",
    "lofi anime rain loop",
    "lofi cozy loop",
    "lofi cafe loop",
    "lofi study room loop",
    "lofi pixel art loop",
    "lofi city rain loop",
    "lofi game loop",

    // Pixel art — scenes & nature
    "pixel art landscape night loop",
    "pixel art autumn forest loop",
    "pixel art waterfall loop",
    "pixel art cherry blossom loop",
    "pixel art sunset loop",
    "pixel art thunderstorm loop",
    "pixel art city night loop",
    "pixel art underwater loop",
    "pixel art rain loop",
    "pixel art winter snow loop",
    "pixel art lighthouse loop",
    "pixel art mountain loop",
    "pixel art space stars loop",

    // Pixel art — gaming & cozy
    "pixel art village loop",
    "pixel art campfire loop",
    "pixel art rpg loop",
    "pixel art dungeon loop",
    "pixel art tavern loop",

    // Gaming & misc
    "retro game loop",
    "liminal space loop",
];

var DEFAULTS = [
    {
        id: "default1", title: "Animation Loop GIF by braindead.gif",
        previewUrl: "https://media1.giphy.com/media/bAUI9dzuSI5b6f0k0r/200.gif",
        gifUrl:     "https://raw.githubusercontent.com/Oted/idlegif/refs/heads/main/assets/default1.gif",
    },
    {
        id: "default2", title: "Art Love GIF by dualvoidanima",
        previewUrl: "https://media1.giphy.com/media/xNW6gz6an1GJzz9pVs/200.gif",
        gifUrl:     "https://raw.githubusercontent.com/Oted/idlegif/refs/heads/main/assets/default2.gif",
    },
    {
        id: "default3", title: "Pixel Art GIF",
        previewUrl: "https://media0.giphy.com/media/pVGsAWjzvXcZW4ZBTE/200.gif",
        gifUrl:     "https://raw.githubusercontent.com/Oted/idlegif/refs/heads/main/assets/default3.gif",
    },
    {
        id: "default4", title: "Relax GIF by Wegow",
        previewUrl: "https://media4.giphy.com/media/XbJYBCi69nyVOffLIU/200.gif",
        gifUrl:     "https://raw.githubusercontent.com/Oted/idlegif/refs/heads/main/assets/default4.gif",
    },
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
