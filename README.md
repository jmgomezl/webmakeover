# WebMakeover

A lightweight Chrome extension that makes any web page easier to read. Adjust
zoom, text size, line spacing and colors from a clean popup, or pick a one‑click
reading preset. Your settings are remembered per site and re‑applied when you
come back.

## Features

- **Reading presets** — Reading, Dark, Sepia and High‑Contrast in one click.
- **Zoom** — scale the whole page from 50% to 200%.
- **Text size** — scale text relative to its original size, so headings, body
  and captions keep their proportions (no flattened‑font look).
- **Line spacing** — from Normal to Very loose for comfortable reading.
- **Custom colors** — set your own background and text color, or clear them.
- **Per‑site memory** — settings are saved for each website via `chrome.storage`
  and restored automatically.
- **Reset** — one button restores the page to its original appearance.

## Install (development)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top‑right).
3. Click **Load unpacked** and select this folder.
4. Pin **WebMakeover** and open it on any page.

## How it works

The popup writes your preferences to `chrome.storage.local` (keyed by the page's
origin) and uses the `scripting` API with `activeTab` to apply them to the
current tab:

- Zoom is applied to the document root.
- Line spacing and colors are applied through a single injected `<style>` element
  so they are easy to remove cleanly.
- Text scaling records each element's original size once, then scales relative to
  it, which preserves the page's visual hierarchy and is fully reversible.

No data ever leaves your browser.

## Project structure

```
manifest.json   Manifest V3 configuration
popup.html      Popup markup
styles.css      Popup styling
popup.js        Popup logic + the code injected into pages
images/         Extension icons (16 / 48 / 128)
```

## Build a store package

```
zip -r webmakeover.zip manifest.json popup.html styles.css popup.js images \
  -x "*.DS_Store"
```

Upload the resulting `webmakeover.zip` in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## License

MIT
