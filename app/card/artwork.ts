import type { ThemeName } from "../theme";
import type { CardRecipe } from "./recipes";

type CardSide = "front" | "back";

// 210 SVG units per inch on a 5 × 3 inch landscape card.
export const CARD_SIZE = { width: 1050, height: 630, holeInset: 60.9, holeRadius: 26.25 } as const;
export const SHEET_CARD_INCHES = { width: 3.5, height: 2 } as const;

// The sheet PDF stretches this artwork to 3.5 × 2 in, so its SVG hole needs
// separate horizontal and vertical radii to print as a true 1/4 in circle.
const sheetHole = {
  insetX: CARD_SIZE.width * 0.29 / SHEET_CARD_INCHES.width,
  insetY: CARD_SIZE.height * 0.29 / SHEET_CARD_INCHES.height,
  radiusX: CARD_SIZE.width * 0.125 / SHEET_CARD_INCHES.width,
  radiusY: CARD_SIZE.height * 0.125 / SHEET_CARD_INCHES.height,
} as const;

// Share white paper and the original blue inks across previews and downloads.
const printPalette = { paper: "#ffffff", ink: "#263b5c", accent: "#6478aa", smallInk: "#405781", muted: "#5c7180", line: "#a3b6c8" };

export function cardPalette() {
  return printPalette;
}

const xml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function cardSvg(_theme: ThemeName, recipe: CardRecipe, side: CardSide, texture = false, sheet = false) {
  const color = cardPalette();
  const smallInk = color.smallInk ?? color.accent;
  const size = texture ? 'width="1680" height="1008"' : 'width="5in" height="3in"';
  const insetX = sheet ? sheetHole.insetX : CARD_SIZE.holeInset;
  const insetY = sheet ? sheetHole.insetY : CARD_SIZE.holeInset;
  const holeRadiusX = sheet ? sheetHole.radiusX : CARD_SIZE.holeRadius;
  const holeRadiusY = sheet ? sheetHole.radiusY : CARD_SIZE.holeRadius;
  const headerX = sheet ? 158 : 117;
  const contentShift = sheet ? 20 : 0;
  const start = `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="0 0 ${CARD_SIZE.width} ${CARD_SIZE.height}">
  <rect width="${CARD_SIZE.width}" height="${CARD_SIZE.height}" fill="${color.paper}"/>${side === "front" ? `
  <rect x="18" y="18" width="1014" height="594" rx="12" fill="none" stroke="${color.line}" stroke-width="2"/>
  <ellipse cx="${insetX}" cy="${insetY}" rx="${holeRadiusX}" ry="${holeRadiusY}" fill="#fff" stroke="${color.accent}" stroke-width="1.5"/>` : ""}`;

  if (side === "back") {
    return `${start}
  <g transform="rotate(-4 340 230)">
    <text x="81" y="263" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="205" font-weight="500" letter-spacing="-24">U・ᴥ・U</text>
    <text x="307" y="345" text-anchor="middle" fill="${color.muted}" font-family="IBM Plex Mono, Courier New, monospace" font-size="37" letter-spacing="2">~ woof ~</text>
  </g>
  <text x="80" y="464" fill="${color.ink}" font-family="IBM Plex Mono, Courier New, monospace" font-size="63" letter-spacing="-2">jelly's lab</text>
</svg>`;
  }

  const ingredients = recipe.ingredients.map((item, index) => `<text x="72" y="${294 + contentShift + index * 42}">${xml(item)}</text>`).join("\n    ");
  const steps = recipe.steps.map((lines, index) => {
    const y = 294 + contentShift + index * 67;
    return `<text x="533" y="${y}" fill="${smallInk}" font-weight="700">${String(index + 1).padStart(2, "0")}</text>
    ${lines.map((line, lineIndex) => `<text x="589" y="${y + lineIndex * 29}">${xml(line)}</text>`).join("\n    ")}`;
  }).join("\n    ");

  return `${start}
  <text x="${headerX}" y="72" fill="${smallInk}" font-family="Courier New, monospace" font-size="24" font-weight="600" letter-spacing="4">RECIPE CARD / ${recipe.number}</text>
  <text x="770" y="104" transform="rotate(-4 882 85)" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="72" font-weight="500" letter-spacing="-8">U・ᴥ・U</text>
  <text x="69" y="${170 + contentShift}" fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="57" font-weight="700" letter-spacing="-2">${xml(recipe.title)}</text>
  <text x="777" y="${171 + contentShift}" fill="${smallInk}" font-family="Courier New, monospace" font-size="22" font-weight="600">${xml(recipe.meta)}</text>
  <path d="M70 ${197 + contentShift}h910" stroke="${color.line}" stroke-width="2"/>
  <path d="M500 ${226 + contentShift}v298" stroke="${color.line}" stroke-width="2" stroke-dasharray="5 8"/>

  <text x="72" y="${245 + contentShift}" fill="${smallInk}" font-family="Courier New, monospace" font-size="23" font-weight="600" letter-spacing="3">WHAT YOU NEED</text>
  <g fill="${color.ink}" font-family="Arial, Helvetica, sans-serif" font-size="30">
    ${ingredients}
  </g>

  <text x="533" y="${245 + contentShift}" fill="${smallInk}" font-family="Courier New, monospace" font-size="23" font-weight="600" letter-spacing="3">MAKE IT</text>
  <g font-family="Arial, Helvetica, sans-serif" font-size="26" fill="${color.ink}">
    ${steps}
  </g>
  <text x="72" y="570" fill="${smallInk}" font-family="Courier New, monospace" font-size="22" font-weight="600">LAB NOTE: ${xml(recipe.note)}</text>
</svg>`;
}

export function cardDataUrl(theme: ThemeName, recipe: CardRecipe, side: CardSide, texture = false, sheet = false) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(theme, recipe, side, texture, sheet))}`;
}
