// View — all DOM rendering and TV remote navigation

function View() {
    var self = this;
    this._callbacks    = {};
    this._focusables   = [];
    this._focusIdx     = 0;
    this._nGiphyItems  = 0; // cards (or 2 for key prompt: input + save btn)
    this._nUrlItems    = 2; // url input + download btn
    this._nActionItems = 2; // test + uninstall
    this._gridMode     = false; // true when showing 2×2 GIF grid

    // Wire static button clicks — callbacks looked up at call time so ordering doesn't matter
    document.getElementById("btn-download").addEventListener("click", function() {
        var url = document.getElementById("url-input").value.trim();
        if (self._callbacks.urlDownload) self._callbacks.urlDownload(url);
    });
    document.getElementById("btn-test").addEventListener("click", function() {
        if (self._callbacks.test) self._callbacks.test();
    });
    document.getElementById("btn-uninstall").addEventListener("click", function() {
        if (self._callbacks.uninstall) self._callbacks.uninstall();
    });

    this._bindNavigation();
}

// ── Callback registration ─────────────────────────────────────────────────────

View.prototype.onApiKeySave  = function(fn) { this._callbacks.apiKeySave  = fn; };
View.prototype.onRefresh     = function(fn) { this._callbacks.refresh     = fn; };
View.prototype.onGifSelect   = function(fn) { this._callbacks.gifSelect   = fn; };
View.prototype.onUrlDownload = function(fn) { this._callbacks.urlDownload = fn; };
View.prototype.onTest        = function(fn) { this._callbacks.test        = fn; };
View.prototype.onUninstall   = function(fn) { this._callbacks.uninstall   = fn; };

// ── GIPHY section ─────────────────────────────────────────────────────────────

View.prototype.renderGiphyGrid = function(gifs, activeGifId) {
    var self    = document.getElementById("giphy-section");
    self.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "gif-grid";

    var cards = [];
    gifs.forEach(function(g, i) {
        var card = document.createElement("div");
        card.className = "gif-card" + (g.id === activeGifId ? " active" : "");
        card.tabIndex  = -1;
        card.dataset.gifId  = g.id;
        card.dataset.gifIdx = i;

        var img = document.createElement("img");
        img.src = g.previewUrl;
        img.alt = g.title;

        var info = document.createElement("div");
        info.className = "info";
        info.innerHTML =
            '<div class="title">' + _escHtml(g.title || "Untitled") + '</div>' +
            '<div class="dims">'  + g.w + "×" + g.h + " &nbsp;·&nbsp; " + g.kb + " KB</div>";

        card.appendChild(img);
        card.appendChild(info);

        var cb = this._callbacks.gifSelect;
        card.addEventListener("click", function() { if (cb) cb(g); });
        grid.appendChild(card);
        cards.push(card);
    }.bind(this));

    // empty placeholder slots
    for (var n = gifs.length; n < 4; n++) {
        var ph = document.createElement("div");
        ph.className = "gif-card placeholder";
        ph.textContent = "—";
        grid.appendChild(ph);
    }

    var btnRefresh = document.getElementById("btn-refresh");
    btnRefresh.style.display = "";
    var cbRefresh = this._callbacks.refresh;
    btnRefresh.onclick = function() { if (cbRefresh) cbRefresh(); };

    document.getElementById("giphy-section").appendChild(grid);

    this._gridMode    = true;
    this._nGiphyItems = cards.length + 1; // cards + refresh btn
    this._rebuildFocusables(cards.concat([btnRefresh]));
};

View.prototype.renderApiKeyPrompt = function() {
    var section = document.getElementById("giphy-section");
    section.innerHTML = "";

    var wrap = document.createElement("div");
    wrap.className = "key-prompt";

    var input = document.createElement("input");
    input.type        = "text";
    input.id          = "key-input";
    input.placeholder = "GIPHY API key — get one free at developers.giphy.com";
    input.spellcheck  = false;
    input.autocomplete = "off";

    var btn = document.createElement("button");
    btn.id          = "btn-save-key";
    btn.className   = "primary";
    btn.textContent = "Save";

    var cb = this._callbacks.apiKeySave;
    var doSave = function() {
        var key = input.value.trim();
        if (key && cb) cb(key);
    };
    btn.addEventListener("click", doSave);
    input.addEventListener("keydown", function(e) { if (e.keyCode === 13) doSave(); });

    wrap.appendChild(input);
    wrap.appendChild(btn);
    section.appendChild(wrap);

    var btnRefresh = document.getElementById("btn-refresh");
    if (btnRefresh) btnRefresh.style.display = "none";

    this._gridMode    = false;
    this._nGiphyItems = 2; // input + save btn
    this._rebuildFocusables([input, btn]);
    input.focus();
};

// ── State updates ─────────────────────────────────────────────────────────────

View.prototype.setLoading = function(on) {
    document.querySelectorAll(".gif-card:not(.placeholder)").forEach(function(c) {
        c.classList.toggle("loading", on);
    });
    var r = document.getElementById("btn-refresh");
    if (r) r.disabled = on;
};

View.prototype.setActiveCard = function(gifId) {
    document.querySelectorAll(".gif-card").forEach(function(c) {
        c.classList.toggle("active", c.dataset.gifId === gifId);
    });
};

View.prototype.setStatus = function(msg, type) {
    var el = document.getElementById("status");
    el.textContent = msg;
    el.className   = type || "";
};

// ── Navigation ────────────────────────────────────────────────────────────────

View.prototype._rebuildFocusables = function(giphyItems) {
    var urlInput   = document.getElementById("url-input");
    var btnDownload = document.getElementById("btn-download");
    var btnTest    = document.getElementById("btn-test");
    var btnUninstall = document.getElementById("btn-uninstall");

    this._focusables  = giphyItems.concat([urlInput, btnDownload, btnTest, btnUninstall]);
    this._nGiphyItems = giphyItems.length;
    this._focusIdx    = 0;
};

View.prototype._bindNavigation = function() {
    var self = this;
    var COLS = 2;

    document.addEventListener("keydown", function(e) {
        var key = e.keyCode;
        if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13) return;

        var active = document.activeElement;
        if (active && active.tagName === "INPUT" && key !== 38 && key !== 40) return;

        e.preventDefault();

        var f      = self._focusables;
        var idx    = self._focusIdx;
        var nG     = self._nGiphyItems;
        var uStart = nG;
        var aStart = nG + self._nUrlItems;
        var aEnd   = aStart + self._nActionItems - 1;

        var inGiphy  = idx < nG;
        var inUrl    = idx >= uStart && idx < aStart;
        var inAction = idx >= aStart;

        if (key === 13) { f[idx] && f[idx].click(); return; }

        var newIdx = idx;

        if (inGiphy && self._gridMode) {
            var nCards    = nG - 1;           // cards only (refresh is last)
            var refreshAt = nG - 1;
            var isRefresh = (idx === refreshAt);

            if (isRefresh) {
                if (key === 37) newIdx = Math.min(COLS - 1, nCards - 1); // → top-right card
                else if (key === 40) newIdx = 0;                          // down → top-left card
            } else {
                var row = Math.floor(idx / COLS);
                var col = idx % COLS;
                if (key === 37 && col > 0) newIdx = idx - 1;
                else if (key === 39) {
                    if (col < COLS - 1 && idx + 1 < nCards) newIdx = idx + 1;
                    else newIdx = refreshAt;
                }
                else if (key === 40) {
                    if (idx + COLS < nCards) newIdx = idx + COLS;
                    else newIdx = uStart;
                }
                else if (key === 38) {
                    if (row > 0) newIdx = idx - COLS;
                    else newIdx = refreshAt;  // top row UP → Refresh (top-right)
                }
            }
        } else if (inGiphy) {
            // Linear (API key prompt: input + save btn — stacked vertically)
            if (key === 40) {
                if (idx < nG - 1) newIdx = idx + 1;   // input → save btn
                else newIdx = uStart;                   // save btn → URL input
            }
            else if (key === 38 && idx > 0) newIdx = idx - 1;  // save btn → input
        } else if (inUrl) {
            var uEnd = uStart + self._nUrlItems - 1;
            if (key === 40) {
                if (idx < uEnd) newIdx = idx + 1;      // URL input → download btn
                else newIdx = aStart;                   // download btn → actions
            }
            else if (key === 38) {
                if (idx > uStart) newIdx = idx - 1;    // download btn → URL input
                else newIdx = self._gridMode ? Math.min(COLS, nG - 2) : nG - 1;  // URL input → bottom of GIPHY
            }
        } else if (inAction) {
            if (key === 37 && idx > aStart) newIdx = idx - 1;
            else if (key === 39 && idx < aEnd) newIdx = idx + 1;
            else if (key === 38) newIdx = uStart + self._nUrlItems - 1;  // → download btn
        }

        self._focusIdx = newIdx;
        f[newIdx] && f[newIdx].focus();
    });
};

// ── Utility ───────────────────────────────────────────────────────────────────

function _escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
