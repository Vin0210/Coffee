/**
 * Editorial placeholder imagery.
 * Every image slot renders a designed SVG "photograph": tonal gradient,
 * top-light glow, a detailed subject motif with drop shadow, film grain,
 * vignette and a caption strip — so the layout reads as real editorial
 * photography even before photos are uploaded. Drop a real URL into
 * SmartImage's `src` and it fades in above the placeholder automatically.
 */
const TONES = {
  cream:    { a: '#FBF7F0', b: '#E7DCC7', ink: '#211A17', soft: '#C9B99A', accent: '#713F3F' },
  sand:     { a: '#F0E9D7', b: '#D9CDAF', ink: '#211A17', soft: '#BBA989', accent: '#713F3F' },
  wash:     { a: '#E6DEC9', b: '#C9BC9B', ink: '#211A17', soft: '#9F916F', accent: '#4F5743' },
  olive:    { a: '#7A8470', b: '#545C48', ink: '#F5F1E8', soft: '#3F4832', accent: '#A9B28F' },
  moss:     { a: '#5D6751', b: '#3E4636', ink: '#F5F1E8', soft: '#2F3727', accent: '#C9C49B' },
  burgundy: { a: '#84504C', b: '#5A2E2E', ink: '#F5F1E8', soft: '#472323', accent: '#D8BE9E' },
  wine:     { a: '#70403D', b: '#482525', ink: '#F5F1E8', soft: '#3A1D1D', accent: '#CBB189' },
  espresso: { a: '#302824', b: '#140F0A', ink: '#F5F1E8', soft: '#2B221B', accent: '#C9A97B' },
  cocoa:    { a: '#4C3D33', b: '#281E16', ink: '#F5F1E8', soft: '#201811', accent: '#D8C0A2' },
  clay:     { a: '#C2915F', b: '#8A5E36', ink: '#211A17', soft: '#6B4522', accent: '#3A2216' },
}

const steam = (t, x = 430) =>
  `<path d="M${x} 470 C ${x - 8} 440 ${x - 20} 402 ${x - 3} 362 ${x - 7} 330" fill="none" stroke="${t.ink}" stroke-opacity="0.2" stroke-width="11" stroke-linecap="round"/>
   <path d="M${x + 46} 454 C ${x + 54} 428 ${x + 42} 388 ${x + 49} 352 ${x + 45} 330" fill="none" stroke="${t.ink}" stroke-opacity="0.12" stroke-width="8" stroke-linecap="round"/>`

const cupBody = (t) =>
  `<ellipse cx="470" cy="778" rx="250" ry="46" fill="${t.ink}" opacity="0.13"/>
  <ellipse cx="470" cy="764" rx="236" ry="42" fill="${t.soft}"/>
  <ellipse cx="470" cy="764" rx="236" ry="42" fill="none" stroke="${t.ink}" stroke-opacity="0.25"/>
  <rect x="352" y="486" width="236" height="252" rx="44" fill="${t.soft}"/>
  <rect x="376" y="502" width="20" height="214" rx="10" fill="${t.a}" opacity="0.95"/>
  <rect x="560" y="520" width="10" height="190" rx="5" fill="${t.a}" opacity="0.5"/>
  <path d="M600 548 q70 44 78 132 q8 44 0 218" fill="none" stroke="${t.soft}" stroke-width="44" stroke-linecap="round"/>
  <line x1="356" y1="732" x2="584" y2="732" stroke="${t.ink}" stroke-opacity="0.18" stroke-width="5"/>`

let motifs = {
  cup: (t) => `${cupBody(t)}
    <ellipse cx="470" cy="506" rx="118" ry="40" fill="${t.b}" opacity="0.5"/>
    ${steam(t)}`,

  latte: (t) => `${cupBody(t)}
    <ellipse cx="470" cy="506" rx="112" ry="38" fill="${t.a}" opacity="0.96"/>
    <path d="M520 494 q-40-28 -86-16 q-34 16 0 26 Z" fill="${t.ink}" opacity="0.45"/>
    <path d="M520 494 q40-28 86-16 q34 16 0 26 Z" fill="${t.ink}" opacity="0.45"/>
    <line x1="476" y1="516" x2="476" y2="544" stroke="${t.ink}" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
    ${steam(t)}`,

  glass: (t) => `
    <ellipse cx="440" cy="812" rx="220" ry="36" fill="${t.ink}" opacity="0.13"/>
    <path d="M350 500 h172 v212 a26 26 0 0 1 -26 0 v-212 Z" fill="none" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="12"/>
    <rect x="366" y="520" width="148" height="180" fill="${t.b}" opacity="0.5"/>
    <rect x="370" y="518" width="10" height="182" fill="${t.a}" opacity="0.4"/>
    <g fill="${t.a}" opacity="0.75">
      <rect x="396" y="560" width="52" height="52" rx="7" transform="rotate(13 422 586)"/>
      <rect x="452" y="612" width="44" height="44" rx="7" transform="rotate(-11 474 634)"/>
    </g>
    <rect x="418" y="258" width="16" height="252" rx="8" transform="rotate(9 426 384)" fill="${t.accent}"/>
    <circle cx="390" cy="524" r="3.5" fill="${t.ink}" opacity="0.4"/>
    <circle cx="412" cy="552" r="3" fill="${t.ink}" opacity="0.4"/>
    <circle cx="382" cy="604" r="3.5" fill="${t.ink}" opacity="0.4"/>`,

  matcha: (t) => `
    <ellipse cx="470" cy="790" rx="250" ry="40" fill="${t.ink}" opacity="0.12"/>
    <ellipse cx="470" cy="768" rx="238" ry="58" fill="${t.soft}"/>
    <ellipse cx="470" cy="760" rx="148" ry="38" fill="${t.accent}" opacity="0.92"/>
    <ellipse cx="470" cy="760" rx="148" ry="38" fill="none" stroke="${t.ink}" stroke-opacity="0.25"/>
    <path d="M352 512 q52 108 116 174 q8 46 0 216" fill="none" stroke="${t.soft}" stroke-width="38" stroke-linecap="round"/>
    <rect x="400" y="382" width="22" height="128" rx="10" fill="${t.ink}" opacity="0.3"/>
    <g stroke="${t.ink}" stroke-opacity="0.35" stroke-width="7" stroke-linecap="round">
      <line x1="398" y1="520" x2="398" y2="586"/>
      <line x1="410" y1="536" x2="410" y2="596"/>
      <line x1="422" y1="512" x2="422" y2="572"/>
    </g>
    ${steam(t, 500)}`,

  croissant: (t) => `
    <ellipse cx="455" cy="800" rx="260" ry="36" fill="${t.ink}" opacity="0.12"/>
    <rect x="322" y="556" width="252" height="150" rx="76" fill="${t.soft}" transform="rotate(14 448 631)"/>
    <rect x="556" y="528" width="228" height="150" rx="76" fill="${t.soft}" transform="rotate(-36 670 603)"/>
    <ellipse cx="492" cy="612" rx="26" ry="80" fill="${t.b}" opacity="0.28"/>
    <path d="M362 588 q52-32 84-64" fill="none" stroke="${t.b}" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round"/>
    <path d="M596 560 q48-26 76-52" fill="none" stroke="${t.b}" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round"/>
    <path d="M352 640 q16-10 34-18 q10-14 18-20 12-10" fill="none" stroke="${t.ink}" stroke-opacity="0.25" stroke-width="10" stroke-linecap="round"/>`,

  loaf: (t) => `
    <ellipse cx="460" cy="790" rx="250" ry="34" fill="${t.ink}" opacity="0.12"/>
    <rect x="320" y="470" width="300" height="262" rx="128" fill="${t.soft}"/>
    <ellipse cx="556" cy="606" rx="46" ry="118" fill="${t.a}" opacity="0.92"/>
    <path d="M548 520 c-34 42 26 96 0 172 q-26 24 0 26" fill="none" stroke="${t.b}" stroke-width="16" stroke-linecap="round" opacity="0.8"/>
    <line x1="382" y1="556" x2="448" y2="668" stroke="${t.ink}" stroke-opacity="0.22" stroke-width="6"/>
    <circle cx="486" cy="692" r="15" fill="${t.a}"/>
    <circle cx="512" cy="716" r="12" fill="${t.a}"/>
    <path d="M480 686 q6-8 10-14" fill="none" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="4"/>`,

  tee: (t) => `
    <ellipse cx="470" cy="838" rx="250" ry="34" fill="${t.ink}" opacity="0.14"/>
    <path d="M300 330 l74-40 a58 58 0 0 0 110 0 l74 40 l-40 88 l-52-22 v268 H396 V404 l-52 22 Z" fill="${t.soft}"/>
    <path d="M400 292 l58-36 a46 46 0 0 0 92 0 l58 36 Z" fill="${t.soft}"/>
    <path d="M292 386 l64 224" fill="none" stroke="${t.ink}" stroke-opacity="0.2" stroke-width="7" stroke-linecap="round"/>
    <g font-family="Georgia,serif" font-style="italic" text-anchor="middle">
      <text x="470" y="470" font-size="54" fill="${t.ink}" opacity="0.5">A ×</text>
      <text x="470" y="540" font-size="54" fill="${t.ink}" opacity="0.5">G H</text>
    </g>
    <path d="M332 424 h276" stroke="${t.ink}" stroke-opacity="0.22" stroke-width="3" stroke-dasharray="10 9"/>`,

  denim: (t) => `
    <ellipse cx="390" cy="850" rx="280" ry="32" fill="${t.ink}" opacity="0.14"/>
    <path d="M300 340 l70-44 a50 50 0 0 0 96 0 l70 44 l-42 92 l-50-26 v248 H404 V404 l-50 26 Z" fill="${t.soft}"/>
    <path d="M392 310 l54-40 a42 42 0 0 0 80 0 l54 40 Z" fill="${t.soft}"/>
    <path d="M302 424 v200" fill="none" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="4"/>
    <path d="M398 424 v200" fill="none" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="4"/>
    <circle cx="470" cy="498" r="16" fill="${t.a}"/>
    <circle cx="470" cy="514" r="8" fill="${t.a}"/>
    <line x1="484" y1="480" x2="500" y2="512" stroke="${t.ink}" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"/>
    <g opacity="0.3" fill="${t.ink}">
      <circle cx="342" cy="600" r="3"/><circle cx="372" cy="646" r="2.6"/><circle cx="412" cy="584" r="2.2"/>
    </g>`,

  rack: (t) => `
    <line x1="190" y1="276" x2="612" y2="276" stroke="${t.ink}" stroke-opacity="0.35" stroke-width="14" stroke-linecap="round"/>
    <g stroke-linecap="round">
      <line x1="272" y1="276" x2="272" y2="600" stroke="${t.ink}" stroke-opacity="0.28" stroke-width="7"/>
      <line x1="548" y1="276" x2="548" y2="600" stroke="${t.ink}" stroke-opacity="0.28" stroke-width="7"/>
    </g>
    <path d="M270 292 h288 v360 a14 14 0 0 1 -14 0 v-360 Z" fill="${t.soft}" opacity="0.94" transform="translate(-70 8)"/>
    <path d="M270 292 h288 v360 a14 14 0 0 1 -14 0 v-360 Z" fill="${t.b}" opacity="0.5" transform="translate(24 0)"/>
    <path d="M270 292 h288 v360 a14 14 0 0 1 -14 0 v-360 Z" fill="${t.a}" opacity="0.66" transform="translate(118 0)"/>
    <path d="M270 292 h288 v360 a14 14 0 0 1 -14 0 v-360 Z" fill="${t.soft}" opacity="0.9" transform="translate(212 10)"/>`,

  arch: (t) => `
    <path d="M180 850 V430 a220 220 0 0 1 440 0 v290 Z" fill="${t.soft}"/>
    <path d="M240 850 V456 a160 160 0 0 1 320 0 v266" fill="none" stroke="${t.ink}" stroke-opacity="0.28" stroke-width="10"/>
    <path d="M430 560 q48 88 104 150 q8 42 0 72" fill="none" stroke="${t.ink}" stroke-opacity="0.4" stroke-width="26" stroke-linecap="round"/>
    <rect x="522" y="556" width="44" height="44" rx="11" fill="${t.a}" transform="rotate(20 544 578)"/>`,

  rings: (t) => `
    <circle cx="400" cy="492" r="232" fill="none" stroke="${t.ink}" stroke-opacity="0.32" stroke-width="26"/>
    <circle cx="400" cy="492" r="150" fill="none" stroke="${t.ink}" stroke-opacity="0.34" stroke-width="18"/>
    <circle cx="400" cy="492" r="66" fill="${t.accent}"/>
    <circle cx="400" cy="492" r="66" fill="none" stroke="${t.ink}" stroke-opacity="0.36" stroke-width="7"/>
    <ellipse cx="316" cy="366" rx="86" ry="56" fill="${t.a}" opacity="0.9" transform="rotate(-28 316 366)"/>`,

  x: (t) => `
    <path d="M250 280 L550 660 M550 280 L250 660" fill="none" stroke="${t.ink}" stroke-opacity="0.34" stroke-width="16" stroke-linecap="round"/>
    <path d="M368 344 L440 400 M440 344 L368 400" fill="none" stroke="${t.ink}" stroke-opacity="0.34" stroke-width="11" stroke-linecap="round"/>
    <circle cx="400" cy="470" r="150" fill="none" stroke="${t.ink}" stroke-opacity="0.24" stroke-width="5"/>
    <circle cx="250" cy="280" r="28" fill="${t.a}" opacity="0.9"/>`,

  stripe: (t) => Array.from({ length: 9 }, (_, i) =>
    `<line x1="${40 + i * 62 - 160}" y1="760" x2="${340 + i * 62 - 160}" y2="180" stroke="${t.ink}" stroke-opacity="0.18" stroke-width="30"/>`
  ).join('') +
    `<rect x="488" y="560" width="196" height="228" rx="54" fill="${t.soft}"/>
     <rect x="556" y="600" width="52" height="70" rx="10" fill="${t.accent}" transform="rotate(18 582 635)"/>`,

  stitch: (t) => `
    <circle cx="400" cy="470" r="224" fill="none" stroke="${t.ink}" stroke-opacity="0.36" stroke-width="30"/>
    <circle cx="400" cy="470" r="134" fill="none" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="9" stroke-dasharray="12 16"/>
    <circle cx="400" cy="470" r="66" fill="${t.soft}"/>
    <path d="M360 470 h80 M400 430 v80" stroke="${t.ink}" stroke-opacity="0.3" stroke-width="8" stroke-linecap="round"/>`,

  beans: (t) => Array.from({ length: 7 }, (_, i) => {
    const c = 248 + Math.round(Math.abs(Math.sin(i * 1.7)) * 190)
    return `<ellipse cx="${c}" cy="${315 + (i % 2) * 172}" rx="24" ry="34" fill="${t.soft}" transform="rotate(${i * 31 - 70} ${c} ${315 + (i % 2) * 172})"/>`
  }).join(''),
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt))
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function build({ label, tone, kind }) {
  const t = TONES[tone] || TONES.sand
  const m = motifs[kind] || motifs.arch
  const caption = (label || 'Alegre × Good Habits').toUpperCase()

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${t.a}"/><stop offset="0.55" stop-color="${t.b}"/><stop offset="1" stop-color="${shade(t.b, -38)}"/>` +
    `</linearGradient>` +
    `<radialGradient id="glow" cx="0.3" cy="0.12" r="0.95">` +
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.06"/><stop offset="1" stop-color="#000000" stop-opacity="0.1"/>` +
    `</radialGradient>` +
    `<radialGradient id="vig" cx="0.5" cy="0.5" r="0.72">` +
    `<stop offset="0.62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/>` +
    `</radialGradient>` +
    `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="${(label || '').length + (tone || '').length + (kind || '').length}"/><feColorMatrix type="saturate" values="0"/></filter>` +
    `</defs>` +
    `<rect width="800" height="1000" fill="url(#bg)"/>` +
    `<rect width="800" height="1000" fill="url(#glow)"/>` +
    `<g transform="translate(0 44)">${m(t)}</g>` +
    `<rect width="800" height="1000" filter="url(#grain)" opacity="0.06"/>` +
    `<rect width="800" height="1000" fill="url(#vig)"/>` +
    `<rect x="34" y="822" width="64" height="2" fill="${t.ink}" opacity="0.5"/>` +
    `<text x="34" y="864" font-family="'Archivo','Helvetica Neue',Arial,sans-serif" font-size="21" font-weight="600" letter-spacing="5" fill="${t.ink}" fill-opacity="0.75">${caption}</text>` +
    `<text x="34" y="898" font-family="'Fraunces',Georgia,serif" font-style="italic" font-size="17" letter-spacing="1" fill="${t.ink}" fill-opacity="0.42">alegre × good habits</text>` +
    `<text x="766" y="82" text-anchor="end" font-family="'Fraunces',Georgia,serif" font-weight="500" font-size="30" fill="${t.ink}" fill-opacity="0.34">A×G</text>` +
    `</svg>`
  )
}

const cache = new Map()

export function phDataUri({ label = 'Alegre', tone = 'sand', kind = 'arch' } = {}) {
  const key = `${label}|${tone}|${kind}`
  if (!cache.has(key)) {
    cache.set(key, 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(build({ label, tone, kind })))
  }
  return cache.get(key)
}
