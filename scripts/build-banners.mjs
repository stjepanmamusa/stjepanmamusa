// Builds the profile banner in two themes from one template, so the light and dark
// versions can never drift apart. Run from the repo root:  node scripts/build-banners.mjs
// Output: assets/banner-dark.svg, assets/banner-light.svg (README picks one via <picture>).

import { mkdirSync, writeFileSync } from 'node:fs';

// Colours come from stjepanmamusa.com (src/styles/global.css + DESIGN.md).
// Light theme: the site is dark-only, so text uses DESIGN.md's inverse-primary (#a33f05),
// which keeps >4.5:1 contrast on white; the brighter #e56f37 is only used for shapes.
const THEMES = {
  dark: {
    bg: '#0b141c', // site surface
    border: '#222b33', // surface-container-high
    text: '#f3f3f3',
    muted: '#9aa7b3',
    accent: '#e56f37', // site accent
    ember: ['#e56f37', '#ffb597', '#e99b75'],
    glow: '#e56f37',
    flame: ['#e56f37', '#ff9a66', '#ffdbcd'], // outer → inner
    log: '#57423a', // outline-variant
  },
  light: {
    bg: '#f6f8fa', // GitHub light canvas-subtle, so the card reads as part of the page
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#59636e',
    accent: '#a33f05', // inverse-primary
    ember: ['#e56f37', '#a33f05', '#c4561e'],
    glow: '#e56f37',
    flame: ['#c4561e', '#e56f37', '#ffb597'],
    log: '#8a6a5c',
  },
};

// Banner wording. Keep each line short: on a phone the 960px banner is scaled to ~350px.
// Wording mirrors stjepanmamusa.com (hero eyebrow + title in src/lib/site.ts); update both together.
const TEXT = {
  eyebrow: 'Java backend · Split, Croatia · CET',
  name: 'Stjepan Mamuša',
  role: 'Backend engineer · Java & Spring Boot',
};

// Fire position: FX is the centre line, FY the ground line the logs sit on.
const FX = 834;
const FY = 236;

// Embers: [x offset from FX, radius, duration s, delay s, drift path]. Fixed values so rebuilds are identical.
const EMBERS = [
  [-14, 2.6, 3.4, 0.0, 'a'],
  [6, 3.4, 4.1, 0.9, 'b'],
  [16, 2.2, 3.0, 1.6, 'c'],
  [-4, 2.8, 3.7, 2.3, 'a'],
  [22, 3.0, 4.4, 0.5, 'b'],
  [-20, 2.0, 3.2, 2.9, 'c'],
  [10, 2.4, 3.6, 1.2, 'a'],
  [-10, 3.1, 4.0, 3.4, 'b'],
];
const EMBER_Y = FY - 96; // embers leave from near the flame tip

// Symmetric teardrop standing on (0,0), h tall and about 1.3·w wide.
const flame = (w, h) => `M0 0 C${-w} 0 ${-w} ${-h * 0.45} 0 ${-h} C${w} ${-h * 0.45} ${w} 0 0 0Z`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function banner(t) {
  const embers = EMBERS.map(([x, r, dur, delay, path], i) => {
    // Static position used when motion is reduced (the animation overrides it otherwise).
    const still = `translate(${(i % 3) * 6 - 6} ${-10 - ((i * 23) % 70)})`;
    return `<circle class="ember" cx="${FX + x}" cy="${EMBER_Y}" r="${r}" fill="${t.ember[i % t.ember.length]}" transform="${still}" style="animation:rise-${path} ${dur}s ease-out ${delay}s infinite backwards"/>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 280" width="960" height="280" role="img" aria-labelledby="title">
  <title id="title">${esc(TEXT.name)}: ${esc(TEXT.role)}</title>
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${t.glow}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    @keyframes rise-a { 0% { transform: translate(0,0); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(-14px,-110px); opacity: 0 } }
    @keyframes rise-b { 0% { transform: translate(0,0); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(10px,-120px); opacity: 0 } }
    @keyframes rise-c { 0% { transform: translate(0,0); opacity: 0 } 20% { opacity: .9 } 100% { transform: translate(-4px,-100px); opacity: 0 } }
    @keyframes flicker { 0%,100% { opacity: .8 } 50% { opacity: 1 } }
    @keyframes sway { 0%,100% { transform: scale(1,1) skewX(0deg) } 30% { transform: scale(.96,1.05) skewX(-2deg) } 65% { transform: scale(1.03,.95) skewX(2deg) } }
    .glow { animation: flicker 2.4s ease-in-out infinite; }
    .flame { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 1.8s ease-in-out infinite; }
    .flame.f2 { animation-duration: 1.4s; animation-delay: -.5s; }
    .flame.f3 { animation-duration: 1.1s; animation-delay: -.2s; }
    @media (prefers-reduced-motion: reduce) {
      .ember { animation: none !important; opacity: .7; }
      .glow, .flame { animation: none !important; }
    }
  </style>

  <rect x="1" y="1" width="958" height="278" rx="14" fill="${t.bg}" stroke="${t.border}" stroke-width="2"/>

  <text class="mono" x="56" y="92" font-size="18" letter-spacing="0.5" fill="${t.accent}">${esc(TEXT.eyebrow)}</text>
  <text class="sans" x="54" y="160" font-size="60" font-weight="600" letter-spacing="-1.5" fill="${t.text}">${esc(TEXT.name)}</text>
  <text class="sans" x="56" y="208" font-size="26" fill="${t.muted}">${esc(TEXT.role)}</text>
  <rect x="56" y="230" width="48" height="3" rx="1.5" fill="${t.accent}"/>

  <g aria-hidden="true">
    <ellipse class="glow" cx="${FX}" cy="${FY - 30}" rx="110" ry="80" fill="url(#glow)"/>
    <g transform="translate(${FX} ${FY})">
      <path class="flame f1" d="${flame(44, 118)}" fill="${t.flame[0]}"/>
      <path class="flame f2" d="${flame(30, 84)}" fill="${t.flame[1]}"/>
      <path class="flame f3" d="${flame(17, 48)}" fill="${t.flame[2]}"/>
      <rect x="-62" y="-8" width="124" height="16" rx="8" fill="${t.log}" transform="rotate(-12)"/>
      <rect x="-62" y="-8" width="124" height="16" rx="8" fill="${t.log}" transform="rotate(12)"/>
    </g>
    ${embers}
  </g>
</svg>
`;
}

mkdirSync('assets', { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(`assets/banner-${name}.svg`, banner(theme), 'utf8');
  console.log(`wrote assets/banner-${name}.svg`);
}
