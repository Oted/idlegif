# Idlegif

<div align="center">
<a href="https://github.com/Oted/idlegif/releases/latest"><img src="https://img.shields.io/github/v/release/Oted/idlegif?style=flat-square" alt="Latest release"/></a>
<a href="https://github.com/Oted/idlegif/releases"><img src="https://img.shields.io/github/downloads/Oted/idlegif/total?style=flat-square" alt="Downloads"/></a>
</div>

Replace the LG webOS screensaver with a looping GIF — browse pixel art and animations via GIPHY or paste any direct GIF URL.

Requires a rooted TV via [Homebrew Channel](https://github.com/webosbrew/webos-homebrew-channel).

> **Disclaimer:** Modifies a system screensaver file via bind-mount. Use at your own risk.

---

## Screenshot

![Idlegif app running on an LG webOS TV](assets/screenshot.png)

---

## Installation

Install via the Homebrew Channel app store, or sideload the `.ipk` from the [latest release](https://github.com/Oted/idlegif/releases/latest).

After installing, open the app and select a GIF. The screensaver activates automatically when your TV idles.

---

## Usage

**First launch — no GIPHY key:** 4 selectable defaults, the URL bar at the bottom lets you input a `.gif` link and download it immediately. No API key required.

**With a GIPHY API key:** Enter your key (free at [developers.giphy.com](https://developers.giphy.com)) to unlock the GIF browser. The key is saved and persists across restarts.

**With SSH access:** If your TV has SSH via Homebrew Channel, you can inject the key without typing it on the TV. Close the app first if it's already open, then run:

```bash
luna-send -n 1 luna://com.webos.service.applicationManager/launch \
  '{"id":"org.oted.idlegif","params":{"giphyApiKey":"YOUR_KEY"}}'
```

**Buttons:**
- **Refresh** — fetch a new set of GIFs from GIPHY
- **Test** — navigate to the home screen and trigger the screensaver to preview it
- **Uninstall** — remove the screensaver override and boot hook

**Navigation:** arrow keys to move, OK to select.

---

## Compatibility

| webOS version | Targets | Status |
|---|---|---|
| webOS 9.x | `Clock.qml` | ✅ Confirmed |
| webOS 5.x – 8.x | `main.qml` | 🧪 Should work |
| webOS 3.x / 4.x | — | ❌ Not supported |


---

## Building from source

Requires [ares-cli](https://webostv.developer.lge.com/develop/tools/cli-installation) and Node 24.

```bash
make update   # build, install to TV, apply bind-mount, launch
make test     # trigger screensaver (navigates home first)
make clean    # remove .ipk artifacts
```

---

## Credits

- [webosbrew/custom-screensaver](https://github.com/webosbrew/custom-screensaver)
- [GIPHY](https://giphy.com)

## License

MIT
