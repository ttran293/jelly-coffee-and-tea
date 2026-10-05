import type { ThemeName } from "../theme";

type CardSide = "front" | "back";

const palettes: Record<ThemeName, { paper: string; ink: string; accent: string; muted: string; line: string }> = {
  butter: { paper: "#f4ebcf", ink: "#292c3e", accent: "#ae3854", muted: "#646470", line: "#b9ad9b" },
  blueberry: { paper: "#232841", ink: "#fbf3e5", accent: "#a8d9f0", muted: "#b9c4d8", line: "#68728d" },
  cherry: { paper: "#40252e", ink: "#fff1df", accent: "#ffb49d", muted: "#d8bdb7", line: "#93636c" },
  lilac: { paper: "#dedaf0", ink: "#302d4a", accent: "#6852af", muted: "#67627a", line: "#a19abf" },
};

export function cardPalette(theme: ThemeName) {
  return palettes[theme];
}

export function cardSvg(theme: ThemeName, side: CardSide, texture = false) {
  const color = palettes[theme];
  const size = texture ? 'width="1680" height="960"' : 'width="3.5in" height="2in"';
  const start = `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 1050 600">
  <rect width="1050" height="600" fill="${color.paper}"/>
  <rect x="24" y="24" width="1002" height="552" rx="14" fill="none" stroke="${color.line}" stroke-width="2"/>`;

  if (side === "back") {
    return `${start}
  <g transform="rotate(-4 340 230)">
    <text x="81" y="263" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="205" font-weight="500" letter-spacing="-24">U・ᴥ・U</text>
    <text x="307" y="345" text-anchor="middle" fill="${color.muted}" font-family="IBM Plex Mono, Courier New, monospace" font-size="37" letter-spacing="2">~ woof ~</text>
  </g>
  <text x="80" y="464" fill="${color.ink}" font-family="IBM Plex Mono, Courier New, monospace" font-size="63" letter-spacing="-2">jelly coffee lab</text>
</svg>`;
  }

  return `${start}
  <text x="71" y="88" fill="${color.accent}" font-family="Courier New, monospace" font-size="24" letter-spacing="4">RECIPE CARD / 02</text>
  <text x="770" y="104" transform="rotate(-4 882 85)" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="72" font-weight="500" letter-spacing="-8">U・ᴥ・U</text>
  <text x="69" y="170" fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="700" letter-spacing="-2">Honey oat espresso</text>
  <text x="784" y="171" fill="${color.accent}" font-family="Courier New, monospace" font-size="22">5 MIN · 1 GLASS</text>
  <path d="M70 197h910" stroke="${color.line}" stroke-width="2"/>
  <path d="M500 226v298" stroke="${color.line}" stroke-width="2" stroke-dasharray="5 8"/>

  <text x="72" y="245" fill="${color.accent}" font-family="Courier New, monospace" font-size="23" letter-spacing="3">WHAT YOU NEED</text>
  <g fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="32">
    <text x="72" y="297">1 double espresso (~36 g)</text>
    <text x="72" y="345">12 g honey</text>
    <text x="72" y="393">150 ml chilled oat milk</text>
    <text x="72" y="441">A tiny pinch of flaky salt</text>
    <text x="72" y="489">Ice</text>
  </g>

  <text x="533" y="245" fill="${color.accent}" font-family="Courier New, monospace" font-size="23" letter-spacing="3">MAKE IT</text>
  <g font-family="Arial, Helvetica, sans-serif" font-size="29" fill="${color.ink}">
    <text x="533" y="295" fill="${color.accent}" font-weight="700">01</text>
    <text x="589" y="295">Stir honey + salt into</text>
    <text x="589" y="329">hot espresso until dissolved.</text>
    <text x="533" y="385" fill="${color.accent}" font-weight="700">02</text>
    <text x="589" y="385">Ice + oat milk in a</text>
    <text x="589" y="419">short glass.</text>
    <text x="533" y="475" fill="${color.accent}" font-weight="700">03</text>
    <text x="589" y="475">Pour espresso over milk;</text>
    <text x="589" y="509">give one gentle stir.</text>
  </g>
  <text x="72" y="548" fill="${color.accent}" font-family="Courier New, monospace" font-size="22">LAB NOTE: DON'T FORGET THE SALT.</text>
</svg>`;
}

export function cardDataUrl(theme: ThemeName, side: CardSide) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(theme, side))}`;
}
