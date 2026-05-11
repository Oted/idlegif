# Idlegif

Replace the LG webOS screensaver with a looping GIF — browse pixel art and animations via GIPHY, or paste any direct GIF URL.

Tested on **webOS 9.2.1**. Requires a rooted TV via [Homebrew Channel](https://github.com/webosbrew/webos-homebrew-channel).

> **Disclaimer:** Modifies a system screensaver file via bind-mount. Use at your own risk.

---

## Installation

Install via the Homebrew Channel app store, or sideload the `.ipk` from the [latest release](https://github.com/Oted/idlegif/releases/latest).

After installing, open the app and select a GIF. The screensaver activates automatically when your TV idles.

---

## Usage

**First launch — no GIPHY key:** The URL bar at the bottom lets you paste link direct `.gif` link and download it immediately. No API key required.

**With a GIPHY API key:** Enter your key (free at [developers.giphy.com](https://developers.giphy.com)) to unlock the GIF browser — a grid of pixel-art and looping animations fetched from GIPHY. Hit **Refresh** for new options.

**Buttons:**
- **Refresh** — fetch a new set of GIFs from GIPHY
- **Test** — navigate to the home screen and trigger the screensaver to preview it
- **Uninstall** — remove the screensaver override and boot hook

**Navigation:** arrow keys to move, OK to select.

---

## Compatibility

| webOS version | Status |
|---|---|
| webOS 9.2.1 (2022 OLED) | Tested ✅ |
| Other webOS 9.x | Likely works |
| webOS other | Unknown — If a clock shows on your screensaver this likely works |

---

## Building from source

Requires [ares-cli](https://webostv.developer.lge.com/develop/tools/cli-installation) and Node 18.

```bash
make update   # build, install to TV, apply bind-mount, launch
make test     # trigger screensaver (navigates home first)
make clean    # remove .ipk artifacts
```

---

## Credits

- [webosbrew/custom-screensaver](https://github.com/webosbrew/custom-screensaver) — bind-mount pattern
- [GIPHY](https://giphy.com) — GIF API

## License

MIT
