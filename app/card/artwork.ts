import type { ThemeName } from "../theme";
import type { CardRecipe } from "./recipes";

type CardSide = "front" | "back";

// 210 SVG units per inch on a 5 × 3 inch landscape card.
export const CARD_SIZE = { width: 1050, height: 630, holeInset: 52.5, holeRadius: 13.125 } as const;

const palettes: Record<ThemeName, { paper: string; ink: string; accent: string; muted: string; line: string }> = {
  butter: { paper: "#f4ebcf", ink: "#292c3e", accent: "#ae3854", muted: "#646470", line: "#b9ad9b" },
  blueberry: { paper: "#232841", ink: "#fbf3e5", accent: "#a8d9f0", muted: "#b9c4d8", line: "#68728d" },
  cherry: { paper: "#40252e", ink: "#fff1df", accent: "#ffb49d", muted: "#d8bdb7", line: "#93636c" },
  lilac: { paper: "#dedaf0", ink: "#302d4a", accent: "#6852af", muted: "#67627a", line: "#a19abf" },
  cloud: { paper: "#fffdf6", ink: "#263b5c", accent: "#5677a7", muted: "#526985", line: "#8fa9cc" },
  blush: { paper: "#fffdfb", ink: "#263b5c", accent: "#a85f7c", muted: "#65718a", line: "#bd9aaf" },
  spring: { paper: "#fcfff9", ink: "#263b5c", accent: "#6478aa", muted: "#5c7180", line: "#a3b6c8" },
  nightfall: { paper: "#ffcee3", ink: "#262277", accent: "#395898", muted: "#596181", line: "#a89fbf" },
  peach: { paper: "#ffe28d", ink: "#13193d", accent: "#624664", muted: "#726278", line: "#ae8b85" },
  tidal: { paper: "#f9d2e4", ink: "#124d57", accent: "#007e79", muted: "#526d70", line: "#9eabb6" },
  garden: { paper: "#fedfcb", ink: "#254b27", accent: "#106816", muted: "#5c6850", line: "#a9a98b" },
};

export function cardPalette(theme: ThemeName) {
  return palettes[theme];
}

const xml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function cardSvg(theme: ThemeName, recipe: CardRecipe, side: CardSide, texture = false) {
  const color = palettes[theme];
  const size = texture ? 'width="1680" height="1008"' : 'width="5in" height="3in"';
  // Mirroring the mark on the reverse keeps one physical punch aligned on a duplex print.
  const holeX = side === "front" ? CARD_SIZE.holeInset : CARD_SIZE.width - CARD_SIZE.holeInset;
  const start = `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 ${CARD_SIZE.width} ${CARD_SIZE.height}">
  <rect width="${CARD_SIZE.width}" height="${CARD_SIZE.height}" fill="${color.paper}"/>
  <rect x="18" y="18" width="1014" height="594" rx="12" fill="none" stroke="${color.line}" stroke-width="2"/>
  <circle cx="${holeX}" cy="${CARD_SIZE.holeInset}" r="22.5" fill="none" stroke="${color.accent}" stroke-width="2.5"/>
  <circle cx="${holeX}" cy="${CARD_SIZE.holeInset}" r="${CARD_SIZE.holeRadius}" fill="#fff" stroke="${color.accent}" stroke-width="1.5"/>`;

  if (side === "back") {
    return `${start}
  <g transform="rotate(-4 340 230)">
    <text x="81" y="263" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="205" font-weight="500" letter-spacing="-24">U・ᴥ・U</text>
    <text x="307" y="345" text-anchor="middle" fill="${color.muted}" font-family="IBM Plex Mono, Courier New, monospace" font-size="37" letter-spacing="2">~ woof ~</text>
  </g>
  <text x="80" y="464" fill="${color.ink}" font-family="IBM Plex Mono, Courier New, monospace" font-size="63" letter-spacing="-2">jelly coffee lab</text>
</svg>`;
  }

  const ingredients = recipe.ingredients.map((item, index) => `<text x="72" y="${294 + index * 42}">${xml(item)}</text>`).join("\n    ");
  const steps = recipe.steps.map((lines, index) => {
    const y = 294 + index * 67;
    return `<text x="533" y="${y}" fill="${color.accent}" font-weight="700">${String(index + 1).padStart(2, "0")}</text>
    ${lines.map((line, lineIndex) => `<text x="589" y="${y + lineIndex * 29}">${xml(line)}</text>`).join("\n    ")}`;
  }).join("\n    ");

  return `${start}
  <text x="101" y="72" fill="${color.accent}" font-family="Courier New, monospace" font-size="24" letter-spacing="4">RECIPE CARD / ${recipe.number}</text>
  <text x="770" y="104" transform="rotate(-4 882 85)" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="72" font-weight="500" letter-spacing="-8">U・ᴥ・U</text>
  <text x="69" y="170" fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="57" font-weight="700" letter-spacing="-2">${xml(recipe.title)}</text>
  <text x="777" y="171" fill="${color.accent}" font-family="Courier New, monospace" font-size="22">${xml(recipe.meta)}</text>
  <path d="M70 197h910" stroke="${color.line}" stroke-width="2"/>
  <path d="M500 226v298" stroke="${color.line}" stroke-width="2" stroke-dasharray="5 8"/>

  <text x="72" y="245" fill="${color.accent}" font-family="Courier New, monospace" font-size="23" letter-spacing="3">WHAT YOU NEED</text>
  <g fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="30">
    ${ingredients}
  </g>

  <text x="533" y="245" fill="${color.accent}" font-family="Courier New, monospace" font-size="23" letter-spacing="3">MAKE IT</text>
  <g font-family="Arial, Helvetica, sans-serif" font-size="26" fill="${color.ink}">
    ${steps}
  </g>
  <text x="72" y="570" fill="${color.accent}" font-family="Courier New, monospace" font-size="22">LAB NOTE: ${xml(recipe.note)}</text>
</svg>`;
}

export function cardDataUrl(theme: ThemeName, recipe: CardRecipe, side: CardSide, texture = false) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(theme, recipe, side, texture))}`;
}
