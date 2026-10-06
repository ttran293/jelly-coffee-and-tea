import type { ThemeName } from "../theme";
import type { CardRecipe } from "./recipes";
import sharp from "sharp";
import { PDFDocument, Duplex, PrintScaling, rgb } from "pdf-lib";
import { cardSvg } from "./artwork";

export type PrintSheetSize = "business" | "recipe";

const POINTS_PER_INCH = 72;
const LETTER = { width: 8.5 * POINTS_PER_INCH, height: 11 * POINTS_PER_INCH };
const layouts = {
  business: { width: 3.5, height: 2, columns: 2, rows: 5 },
  recipe: { width: 5, height: 3, columns: 1, rows: 3 },
} as const;

export async function cardSheetPdf(theme: ThemeName, recipe: CardRecipe, size: PrintSheetSize) {
  const layout = layouts[size];
  const pixelSize = size === "business" ? { width: 1050, height: 600 } : { width: 1500, height: 900 };
  const renderSide = (side: "front" | "back") => sharp(Buffer.from(cardSvg(theme, recipe, side)), { density: 300 })
    .resize({ ...pixelSize, fit: "fill" })
    .png()
    .toBuffer();
  const [frontPng, backPng] = await Promise.all([renderSide("front"), renderSide("back")]);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${recipe.title} - double-sided card sheet`);
  pdf.setSubject("US Letter card sheet: fronts on page 1, backs on page 2");
  const preferences = pdf.catalog.getOrCreateViewerPreferences();
  preferences.setDuplex(Duplex.DuplexFlipLongEdge);
  preferences.setPrintScaling(PrintScaling.None);

  const front = await pdf.embedPng(frontPng);
  const back = await pdf.embedPng(backPng);
  const cardWidth = layout.width * POINTS_PER_INCH;
  const cardHeight = layout.height * POINTS_PER_INCH;
  const left = (LETTER.width - cardWidth * layout.columns) / 2;
  const bottom = (LETTER.height - cardHeight * layout.rows) / 2;
  const markColor = rgb(0.48, 0.48, 0.48);

  for (const image of [front, back]) {
    const page = pdf.addPage([LETTER.width, LETTER.height]);
    for (let row = 0; row < layout.rows; row++) {
      for (let column = 0; column < layout.columns; column++) {
        page.drawImage(image, {
          x: left + column * cardWidth,
          y: bottom + (layout.rows - row - 1) * cardHeight,
          width: cardWidth,
          height: cardHeight,
        });
      }
    }

    // Short marks stay in the page margins, clear of the printed card faces.
    for (let column = 0; column <= layout.columns; column++) {
      const x = left + column * cardWidth;
      page.drawLine({ start: { x, y: bottom - 11 }, end: { x, y: bottom - 2 }, thickness: 0.5, color: markColor });
      page.drawLine({ start: { x, y: LETTER.height - bottom + 2 }, end: { x, y: LETTER.height - bottom + 11 }, thickness: 0.5, color: markColor });
    }
    for (let row = 0; row <= layout.rows; row++) {
      const y = bottom + row * cardHeight;
      page.drawLine({ start: { x: left - 11, y }, end: { x: left - 2, y }, thickness: 0.5, color: markColor });
      page.drawLine({ start: { x: LETTER.width - left + 2, y }, end: { x: LETTER.width - left + 11, y }, thickness: 0.5, color: markColor });
    }
  }

  return pdf.save();
}
