// Generate self-contained popup snapshots in each preset state,
// pixel-accurate to the real extension (same styles.css, same JS math).
const fs = require('fs');
const path = require('path');

const SRC = '/Users/juan/JuanMa/Personal/Procastinacion/webmakeover-src';
const OUT = __dirname;
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');

const DEFAULTS = { preset: null, zoom: 100, fontScale: 100, spacing: 100, bgColor: null, textColor: null };
const PRESETS = {
  reading:  { zoom: 100, fontScale: 120, spacing: 170, bgColor: '#fbf7f0', textColor: '#33302b' },
  dark:     { zoom: 100, fontScale: 100, spacing: 150, bgColor: '#1a1a1a', textColor: '#d4d4d4' },
  sepia:    { zoom: 100, fontScale: 110, spacing: 150, bgColor: '#f4ecd8', textColor: '#5b4636' },
  contrast: { zoom: 100, fontScale: 120, spacing: 150, bgColor: '#000000', textColor: '#ffffff' }
};
const RANGE = { zoom: [50,200], fontScale: [70,200], spacing: [100,300] };

function spacingLabel(v){ if(v<=110)return'Normal'; if(v<=160)return'Relaxed'; if(v<=220)return'Loose'; return'Very loose'; }
function fill(key,v){ const [min,max]=RANGE[key]; return ((v-min)/(max-min)*100).toFixed(1)+'%'; }

function stamp(id,b,i,active){
  return `<button class="stamp" data-preset="${id}" aria-pressed="${active?'true':'false'}"><b>${b}</b><i>${i}</i></button>`;
}

function render(state){
  const s = { ...DEFAULTS, ...(state.preset?PRESETS[state.preset]:{}), preset: state.preset };
  const scale = (s.fontScale/100)*(s.zoom/100);
  const bodyFs = (16*scale).toFixed(1)+'px';
  const bodyLh = (s.spacing/100).toFixed(2);
  const sheetBg = s.bgColor || 'var(--sheet)';
  const sheetCol = s.textColor || 'var(--ink)';
  const bgVal = s.bgColor || '#ffffff', inkVal = s.textColor || '#000000';
  const bgOp = s.bgColor?1:0.45, inkOp = s.textColor?1:0.45;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
  html,body{margin:0}
  ${css}
  </style></head><body>
  <main class="paper">
    <div class="grain"></div><span class="crop tl"></span><span class="crop tr"></span>
    <header class="masthead">
      <div class="wordmark"><h1>Web<em>makeover</em></h1><p class="kicker">The&nbsp;reading&nbsp;studio · Nº&nbsp;1</p></div>
      <span class="seal">Aa</span>
    </header>
    <figure class="specimen">
      <div class="sheet" style="background:${sheetBg};color:${sheetCol}">
        <p class="byline">The Studio Reader</p>
        <p class="body" style="font-size:${bodyFs};line-height:${bodyLh}"><span class="dropcap">R</span>eading should feel effortless. Reshape the size, spacing and color of any page until the words settle and the noise fades into the margins.</p>
      </div>
      <figcaption>Live preview — updates as you tune</figcaption>
    </figure>
    <nav class="presets">
      ${stamp('reading','Reading','warm',s.preset==='reading')}
      ${stamp('dark','Dark','low light',s.preset==='dark')}
      ${stamp('sepia','Sepia','paper',s.preset==='sepia')}
      ${stamp('contrast','High','contrast',s.preset==='contrast')}
    </nav>
    <section class="controls">
      <div class="control"><div class="row"><label>Zoom</label><output>${s.zoom}%</output></div>
        <input type="range" min="50" max="200" value="${s.zoom}" style="--fill:${fill('zoom',s.zoom)}"></div>
      <div class="control"><div class="row"><label>Text size</label><output>${s.fontScale}%</output></div>
        <input type="range" min="70" max="200" value="${s.fontScale}" style="--fill:${fill('fontScale',s.fontScale)}"></div>
      <div class="control"><div class="row"><label>Line spacing</label><output>${spacingLabel(s.spacing)}</output></div>
        <input type="range" min="100" max="300" value="${s.spacing}" style="--fill:${fill('spacing',s.spacing)}"></div>
    </section>
    <section class="colors">
      <div class="swatch"><label>Paper</label><div class="pick"><input type="color" value="${bgVal}" style="opacity:${bgOp}"><button class="clear">clear</button></div></div>
      <div class="swatch"><label>Ink</label><div class="pick"><input type="color" value="${inkVal}" style="opacity:${inkOp}"><button class="clear">clear</button></div></div>
    </section>
    <button class="restore"><span class="glyph">↺</span> Restore original page</button>
  </main></body></html>`;
}

for (const st of [{preset:null,name:'default'},{preset:'reading',name:'reading'},{preset:'dark',name:'dark'},{preset:'sepia',name:'sepia'},{preset:'contrast',name:'contrast'}]) {
  fs.writeFileSync(path.join(OUT, `snap-${st.name}.html`), render(st));
  console.log('wrote snap-'+st.name+'.html');
}
