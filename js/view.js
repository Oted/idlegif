// View — all DOM rendering and TV remote navigation

function View() {
    var self = this;
    this._callbacks    = {};
    this._focusables   = [];
    this._focusIdx     = 0;
    this._nGiphyItems  = 5; // 4 cards + refresh btn (always grid now)
    this._nKeyItems    = 2; // key input + save, or clear btn
    this._nUrlItems    = 2; // url input + download btn
    this._nActionItems = 2; // test + uninstall

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
View.prototype.onApiKeyClear = function(fn) { this._callbacks.apiKeyClear = fn; };
View.prototype.onRefresh     = function(fn) { this._callbacks.refresh     = fn; };
View.prototype.onGifSelect   = function(fn) { this._callbacks.gifSelect   = fn; };
View.prototype.onUrlDownload = function(fn) { this._callbacks.urlDownload = fn; };
View.prototype.onTest        = function(fn) { this._callbacks.test        = fn; };
View.prototype.onUninstall   = function(fn) { this._callbacks.uninstall   = fn; };

// ── GIPHY section ─────────────────────────────────────────────────────────────

View.prototype.renderGiphyGrid = function(gifs, activeGifId, hasKey) {
    var section = document.getElementById("giphy-section");
    section.innerHTML = "";

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
        var dims = (g.w && g.kb)
            ? '<div class="dims">' + g.w + "×" + g.h + " &nbsp;·&nbsp; " + g.kb + " KB</div>"
            : "";
        info.innerHTML = '<div class="title">' + _escHtml(g.title || "Untitled") + '</div>' + dims;

        card.appendChild(img);
        card.appendChild(info);

        var cb = this._callbacks.gifSelect;
        card.addEventListener("click", function() { if (cb) cb(g); });
        grid.appendChild(card);
        cards.push(card);
    }.bind(this));

    for (var n = gifs.length; n < 4; n++) {
        var ph = document.createElement("div");
        ph.className = "gif-card placeholder";
        ph.textContent = "—";
        grid.appendChild(ph);
    }

    section.appendChild(grid);

    var keyItems = this._renderKeyRow(hasKey, section);

    var btnRefresh = document.getElementById("btn-refresh");
    btnRefresh.disabled = !hasKey;
    var cbRefresh = this._callbacks.refresh;
    btnRefresh.onclick = function() { if (cbRefresh) cbRefresh(); };

    this._rebuildFocusables(cards.concat([btnRefresh]), keyItems);
};

View.prototype._renderKeyRow = function(hasKey, section) {
    var row = document.createElement("div");
    row.className = "key-row" + (hasKey ? " connected" : "");

    if (hasKey) {
        var status = document.createElement("span");
        status.className = "giphy-status";
        status.textContent = "GIPHY connected";

        var clearBtn = document.createElement("button");
        clearBtn.id = "btn-clear-key";
        clearBtn.textContent = "Clear key";

        var cbClear = this._callbacks.apiKeyClear;
        clearBtn.addEventListener("click", function() { if (cbClear) cbClear(); });

        row.appendChild(status);
        row.appendChild(clearBtn);
        section.appendChild(row);
        return [clearBtn];
    } else {
        var input = document.createElement("input");
        input.type = "text";
        input.id = "key-input";
        input.placeholder = "GIPHY API key (optional — free at developers.giphy.com)";
        input.spellcheck = false;
        input.autocomplete = "off";

        var saveBtn = document.createElement("button");
        saveBtn.id = "btn-save-key";
        saveBtn.className = "primary";
        saveBtn.textContent = "Connect GIPHY";

        var cbSave = this._callbacks.apiKeySave;
        var doSave = function() {
            var key = input.value.trim();
            if (key && cbSave) cbSave(key);
        };
        saveBtn.addEventListener("click", doSave);
        input.addEventListener("keydown", function(e) { if (e.keyCode === 13) doSave(); });

        row.appendChild(input);
        row.appendChild(saveBtn);
        section.appendChild(row);
        return [input, saveBtn];
    }
};

// ── State updates ─────────────────────────────────────────────────────────────

View.prototype.setLoading = function(on) {
    document.querySelectorAll(".gif-card:not(.placeholder)").forEach(function(c) {
        c.classList.toggle("loading", on);
    });
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

View.prototype._rebuildFocusables = function(giphyItems, keyItems) {
    var urlInput     = document.getElementById("url-input");
    var btnDownload  = document.getElementById("btn-download");
    var btnTest      = document.getElementById("btn-test");
    var btnUninstall = document.getElementById("btn-uninstall");

    keyItems = keyItems || [];
    var prev = this._focusIdx;
    this._focusables  = giphyItems.concat(keyItems, [urlInput, btnDownload, btnTest, btnUninstall]);
    this._nGiphyItems = giphyItems.length;
    this._nKeyItems   = keyItems.length;
    this._focusIdx    = prev < this._focusables.length ? prev : 0;
    this._focusables[this._focusIdx] && this._focusables[this._focusIdx].focus();
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
        var nG     = self._nGiphyItems;  // 4 cards + refresh = 5
        var nK     = self._nKeyItems;
        var kStart = nG;
        var uStart = nG + nK;
        var aStart = uStart + self._nUrlItems;
        var aEnd   = aStart + self._nActionItems - 1;

        var inGiphy  = idx < nG;
        var inKey    = nK > 0 && idx >= kStart && idx < uStart;
        var inUrl    = idx >= uStart && idx < aStart;
        var inAction = idx >= aStart;

        if (key === 13) { f[idx] && f[idx].click(); return; }

        var newIdx = idx;

        if (inGiphy) {
            var nCards    = nG - 1;       // 4
            var refreshAt = nG - 1;       // 4
            var isRefresh = (idx === refreshAt);

            if (isRefresh) {
                if (key === 37) newIdx = Math.min(COLS - 1, nCards - 1); // → top-right card
                else if (key === 40) newIdx = 0;                          // → top-left card
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
                    else newIdx = kStart; // bottom row → key zone
                }
                else if (key === 38) {
                    if (row > 0) newIdx = idx - COLS;
                    else newIdx = refreshAt; // top row UP → Refresh
                }
            }
        } else if (inKey) {
            var kEnd = kStart + nK - 1;
            if (key === 40) {
                if (idx < kEnd) newIdx = idx + 1;
                else newIdx = uStart;
            } else if (key === 38) {
                if (idx > kStart) newIdx = idx - 1;
                else newIdx = nG - 2; // → bottom-left card (idx 2)
            } else if (key === 37 && idx > kStart) {
                newIdx = idx - 1;
            } else if (key === 39 && idx < kEnd) {
                newIdx = idx + 1;
            }
        } else if (inUrl) {
            var uEnd = uStart + self._nUrlItems - 1;
            if (key === 40) {
                if (idx < uEnd) newIdx = idx + 1;
                else newIdx = aStart;
            } else if (key === 38) {
                if (idx > uStart) newIdx = idx - 1;
                else newIdx = nK > 0 ? kStart + nK - 1 : nG - 2; // → last key item
            }
        } else if (inAction) {
            if (key === 37 && idx > aStart) newIdx = idx - 1;
            else if (key === 39 && idx < aEnd) newIdx = idx + 1;
            else if (key === 38) newIdx = uStart + self._nUrlItems - 1; // → download btn
        }

        self._focusIdx = newIdx;
        f[newIdx] && f[newIdx].focus();
    });
};

// ── Utility ───────────────────────────────────────────────────────────────────

function _escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
