import type { ThemeName } from "../theme";
import type { CardRecipe } from "./recipes";
import sharp from "sharp";
import { PDFDocument, PrintScaling, rgb } from "pdf-lib";
import { cardSvg } from "./artwork";

export type PrintSheetSide = "front" | "back";

const POINTS_PER_INCH = 72;
const LETTER = { width: 8.5 * POINTS_PER_INCH, height: 11 * POINTS_PER_INCH };
const layout = { width: 3.5, height: 2, columns: 2, rows: 5 } as const;

export async function cardSheetPdf(theme: ThemeName, recipes: CardRecipe[], side: PrintSheetSide) {
  const pixelSize = { width: 1050, height: 600 };
  const renderSide = (recipe: CardRecipe, side: "front" | "back") => sharp(Buffer.from(cardSvg(theme, recipe, side)), { density: 300 })
    .resize({ ...pixelSize, fit: "fill" })
    .png()
    .toBuffer();
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${recipes.length} Jelly Coffee Lab recipe card ${side}s`);
  pdf.setSubject(`US Letter sheets of 3.5 × 2 inch card ${side}s`);
  const preferences = pdf.catalog.getOrCreateViewerPreferences();
  preferences.setPrintScaling(PrintScaling.None);

  const uniqueRecipes = [...new Map(recipes.map((recipe) => [recipe.id, recipe])).values()];
  const fronts = side === "front"
    ? new Map(await Promise.all(uniqueRecipes.map(async (recipe) => [recipe.id, await pdf.embedPng(await renderSide(recipe, "front"))] as const)))
    : null;
  const back = side === "back" ? await pdf.embedPng(await renderSide(recipes[0], "back")) : null;
  const cardWidth = layout.width * POINTS_PER_INCH;
  const cardHeight = layout.height * POINTS_PER_INCH;
  const left = (LETTER.width - cardWidth * layout.columns) / 2;
  const bottom = (LETTER.height - cardHeight * layout.rows) / 2;
  const markColor = rgb(0.48, 0.48, 0.48);

  const cardsPerSheet = layout.columns * layout.rows;
  for (let offset = 0; offset < recipes.length; offset += cardsPerSheet) {
    const sheetRecipes = recipes.slice(offset, offset + cardsPerSheet);
    const page = pdf.addPage([LETTER.width, LETTER.height]);
    sheetRecipes.forEach((_, index) => {
      const row = Math.floor(index / layout.columns);
      const column = index % layout.columns;
      // Manually turning the sheet over on its long edge mirrors the columns.
      const printedColumn = side === "back" ? layout.columns - column - 1 : column;
      page.drawImage(side === "front" ? fronts!.get(recipes[offset + index].id)! : back!, {
        x: left + printedColumn * cardWidth,
        y: bottom + (layout.rows - row - 1) * cardHeight,
        width: cardWidth,
        height: cardHeight,
      });
    });

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
