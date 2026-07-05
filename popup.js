// WebMakeover popup logic.
// Settings are stored per-site and re-applied to the active tab on demand.

const DEFAULTS = {
  preset: null,
  zoom: 100,       // page zoom, percent
  fontScale: 100,  // relative text size, percent (100 = original)
  spacing: 100,    // line-height, percent (100 = single spacing)
  bgColor: null,   // hex string or null (not applied)
  textColor: null  // hex string or null (not applied)
};

const PRESETS = {
  reading:  { zoom: 100, fontScale: 120, spacing: 170, bgColor: '#fbf7f0', textColor: '#33302b' },
  dark:     { zoom: 100, fontScale: 100, spacing: 150, bgColor: '#1a1a1a', textColor: '#d4d4d4' },
  sepia:    { zoom: 100, fontScale: 110, spacing: 150, bgColor: '#f4ecd8', textColor: '#5b4636' },
  contrast: { zoom: 100, fontScale: 120, spacing: 150, bgColor: '#000000', textColor: '#ffffff' }
};

let activeTab = null;
let originKey = null;
let settings = { ...DEFAULTS };

// --- Elements ---
const el = {
  zoom: document.getElementById('zoom'),
  fontScale: document.getElementById('fontScale'),
  spacing: document.getElementById('spacing'),
  bgColor: document.getElementById('bgColor'),
  textColor: document.getElementById('textColor'),
  zoomOut: document.getElementById('zoomOut'),
  fontScaleOut: document.getElementById('fontScaleOut'),
  spacingOut: document.getElementById('spacingOut'),
  bgClear: document.getElementById('bgClear'),
  textClear: document.getElementById('textClear'),
  reset: document.getElementById('reset'),
  unsupported: document.getElementById('unsupported'),
  presets: document.querySelectorAll('.preset')
};

// --- Init ---
init();

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (!tab || !isSupported(tab.url)) {
    el.unsupported.hidden = false;
    disableControls();
    return;
  }

  originKey = 'wm:' + safeOrigin(tab.url);
  const stored = await chrome.storage.local.get(originKey);
  settings = { ...DEFAULTS, ...(stored[originKey] || {}) };

  syncControls();
  wireEvents();
  await apply(); // re-apply saved look in case the page reloaded
}

function isSupported(url) {
  return !!url && /^https?:|^file:|^ftp:/.test(url);
}

function safeOrigin(url) {
  try { return new URL(url).origin; } catch { return url; }
}

// --- UI wiring ---
function wireEvents() {
  el.zoom.addEventListener('input', () => onControl('zoom', +el.zoom.value));
  el.fontScale.addEventListener('input', () => onControl('fontScale', +el.fontScale.value));
  el.spacing.addEventListener('input', () => onControl('spacing', +el.spacing.value));
  el.bgColor.addEventListener('input', () => onControl('bgColor', el.bgColor.value));
  el.textColor.addEventListener('input', () => onControl('textColor', el.textColor.value));

  el.bgClear.addEventListener('click', () => onControl('bgColor', null));
  el.textClear.addEventListener('click', () => onControl('textColor', null));

  el.presets.forEach(btn =>
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset))
  );

  el.reset.addEventListener('click', resetAll);
}

function onControl(key, value) {
  settings[key] = value;
  settings.preset = null; // manual tweak leaves the preset state
  syncControls();
  persist();
  apply();
}

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  settings = { ...DEFAULTS, ...p, preset: name };
  syncControls();
  persist();
  apply();
}

function resetAll() {
  settings = { ...DEFAULTS };
  syncControls();
  persist();
  apply();
}

// --- Reflect state into the popup UI ---
function syncControls() {
  el.zoom.value = settings.zoom;
  el.fontScale.value = settings.fontScale;
  el.spacing.value = settings.spacing;
  el.zoomOut.textContent = settings.zoom + '%';
  el.fontScaleOut.textContent = settings.fontScale + '%';
  el.spacingOut.textContent = spacingLabel(settings.spacing);

  el.bgColor.value = settings.bgColor || '#ffffff';
  el.textColor.value = settings.textColor || '#000000';
  el.bgColor.style.opacity = settings.bgColor ? '1' : '0.4';
  el.textColor.style.opacity = settings.textColor ? '1' : '0.4';

  el.presets.forEach(btn =>
    btn.classList.toggle('active', btn.dataset.preset === settings.preset)
  );
}

function spacingLabel(v) {
  if (v <= 110) return 'Normal';
  if (v <= 160) return 'Relaxed';
  if (v <= 220) return 'Loose';
  return 'Very loose';
}

// --- Persistence ---
function persist() {
  if (originKey) chrome.storage.local.set({ [originKey]: settings });
}

function disableControls() {
  [el.zoom, el.fontScale, el.spacing, el.bgColor, el.textColor,
   el.bgClear, el.textClear, el.reset, ...el.presets]
    .forEach(node => { node.disabled = true; });
}

// --- Apply to the page ---
async function apply() {
  if (!activeTab) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id, allFrames: true },
      func: applyToPage,
      args: [settings]
    });
  } catch (e) {
    el.unsupported.hidden = false;
  }
}

// Runs in the context of the web page. Must be self-contained.
function applyToPage(s) {
  const STYLE_ID = 'webmakeover-style';
  const ATTR = 'data-wm-fs';
  const root = document.documentElement;

  // Zoom
  root.style.zoom = (s.zoom && s.zoom !== 100) ? (s.zoom / 100) : '';

  // Spacing + colors via one injected stylesheet
  let css = '';
  if (s.spacing && s.spacing !== 100) {
    css += `html body, html body * { line-height: ${(s.spacing / 100).toFixed(2)} !important; }\n`;
  }
  if (s.bgColor) {
    css += `html, html body { background-color: ${s.bgColor} !important; }\n`;
    css += `html body *:not(a):not(button):not(input):not(textarea):not(select) { background-color: transparent !important; }\n`;
  }
  if (s.textColor) {
    css += `html body, html body *:not(a) { color: ${s.textColor} !important; }\n`;
    css += `html body a { color: ${s.textColor} !important; opacity: 0.85; }\n`;
  }

  let styleEl = document.getElementById(STYLE_ID);
  if (css) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      root.appendChild(styleEl);
    }
    styleEl.textContent = css;
  } else if (styleEl) {
    styleEl.remove();
  }

  // Relative font scaling (keeps the page's visual hierarchy)
  const factor = (s.fontScale || 100) / 100;
  const nodes = document.querySelectorAll('body, body *');
  if (factor === 1) {
    nodes.forEach(n => {
      if (n.hasAttribute(ATTR)) {
        n.style.fontSize = n.getAttribute(ATTR);
        n.removeAttribute(ATTR);
        if (!n.getAttribute('style')) n.removeAttribute('style');
      }
    });
  } else {
    nodes.forEach(n => {
      let orig = n.getAttribute(ATTR);
      if (orig === null) {
        orig = window.getComputedStyle(n).fontSize;
        n.setAttribute(ATTR, orig);
      }
      const px = parseFloat(orig);
      if (px) n.style.fontSize = (px * factor).toFixed(2) + 'px';
    });
  }
}
