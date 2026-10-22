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
// Keep matching roles identical on both sides, including rasterized downloads.
const cardType = {
  title: 'font-family="Arial, Helvetica, sans-serif" font-size="57" font-weight="700" letter-spacing="-2"',
  label: 'font-family="Courier New, monospace" font-size="24" font-weight="600" letter-spacing="4"',
  caption: 'font-family="Courier New, monospace" font-size="22" font-weight="600"',
} as const;

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
    // Twelve blank spaces for physical stamps; keep the mirrored binding-hole
    // area at the upper right clear in both the texture and print artwork.
    const scallop = Array.from({ length: 192 }, (_, index) => {
      const angle = index * Math.PI * 2 / 192;
      const radius = 54 + 3 * Math.cos(angle * 16);
      return `${index === 0 ? "M" : "L"}${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`;
    }).join(" ") + " Z";
    const stamps = Array.from({ length: 12 }, (_, index) => {
      const x = 150 + (index % 6) * 150;
      const y = 300 + Math.floor(index / 6) * 150;
      return `<path d="${scallop}" transform="translate(${x} ${y})" fill="${color.paper}" stroke="${index === 11 ? color.accent : color.line}" stroke-width="${index === 11 ? 3 : 2}"/>
  <text x="${x}" y="${y + 7}" text-anchor="middle" fill="${color.muted}" ${cardType.caption}>${String(index + 1).padStart(2, "0")}</text>`;
    }).join("\n  ");
    return `${start}
  <rect x="18" y="18" width="1014" height="594" rx="12" fill="none" stroke="${color.line}" stroke-width="2"/>
  <text x="72" y="72" fill="${smallInk}" ${cardType.label}>A LITTLE CUP CLUB</text>
  <text x="69" y="170" fill="${color.ink}" ${cardType.title}>jelly's lab</text>
  <text x="770" y="104" transform="rotate(-4 882 85)" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="72" font-weight="500" letter-spacing="-8">U・ᴥ・U</text>
  <path d="M70 197h910" stroke="${color.line}" stroke-width="2"/>
  ${stamps}
  <text x="72" y="570" fill="${smallInk}" ${cardType.caption}>GOOD SIPS, LITTLE RITUALS.</text>
  <text x="978" y="570" text-anchor="end" fill="${smallInk}" ${cardType.caption}>~ woof ~</text>
</svg>`;
  }

  const ingredients = recipe.ingredients.map((item, index) => `<text x="72" y="${294 + contentShift + index * 42}">${xml(item)}</text>`).join("\n    ");
  const steps = recipe.steps.map((lines, index) => {
    const y = 294 + contentShift + index * 67;
    return `<text x="533" y="${y}" fill="${smallInk}" font-weight="700">${String(index + 1).padStart(2, "0")}</text>
    ${lines.map((line, lineIndex) => `<text x="589" y="${y + lineIndex * 29}">${xml(line)}</text>`).join("\n    ")}`;
  }).join("\n    ");

  return `${start}
  <text x="${headerX}" y="72" fill="${smallInk}" ${cardType.label}>RECIPE CARD / ${recipe.number}</text>
  <text x="770" y="104" transform="rotate(-4 882 85)" fill="${color.accent}" font-family="Segoe UI Symbol, IBM Plex Mono, monospace" font-size="72" font-weight="500" letter-spacing="-8">U・ᴥ・U</text>
  <text x="69" y="${170 + contentShift}" fill="${color.ink}" ${cardType.title}>${xml(recipe.title)}</text>
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
  <text x="72" y="570" fill="${smallInk}" ${cardType.caption}>LAB NOTE: ${xml(recipe.note)}</text>
</svg>`;
}

export function cardDataUrl(theme: ThemeName, recipe: CardRecipe, side: CardSide, texture = false, sheet = false) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(theme, recipe, side, texture, sheet))}`;
}
