import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import sharp from "sharp";
import { PDFDocument, PrintScaling, rgb } from "pdf-lib";

// Use the same recipe content and artwork as the site, without running Next.js.
async function loadSource(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { CARD_RECIPES } = await loadSource("../app/card/recipes.ts");
const { cardSvg, CARD_SIZE } = await loadSource("../app/card/artwork.ts");
// Explicit selection keeps this customer download stable as new recipes are added.
const recipeIds = [
  "basic-matcha-latte", "lemon-tea-batch", "lemon-matcha",
  "salted-maple-matcha-latte", "salted-cheese-cocoa",
];
const recipes = recipeIds.map((id) => {
  const recipe = CARD_RECIPES.find((item) => item.id === id);
  if (!recipe) throw new Error(`Missing download recipe: ${id}`);
  return recipe;
});
const pdf = await PDFDocument.create();
pdf.setTitle("Jelly's Lab - 10 Double-Sided Drink Recipe Cards");
pdf.setAuthor("Jelly's Lab");
pdf.setSubject("5 drink recipes, 2 copies each. US Letter, actual size, duplex long-edge flip. 3.5 x 2.1 inch cards matching the SVG preview.");
pdf.catalog.getOrCreateViewerPreferences().setPrintScaling(PrintScaling.None);
const ink = rgb(0.25, 0.34, 0.51);
const pages = 2;
const cardWidth = 252;
const cardHeight = cardWidth * CARD_SIZE.height / CARD_SIZE.width;
const left = (612 - cardWidth * 2) / 2;
const bottom = (792 - cardHeight * 5) / 2;
// Render precisely the flat preview's SVG. The old sheet variant moved the
// header/body and enlarged the hole; stretching it also distorted the type.
async function renderPreview(recipe, side) {
  return sharp(Buffer.from(cardSvg("spring", recipe, side)), { density: 300 })
    .resize({ width: 1500 }).png().toBuffer();
}
const fronts = await Promise.all(recipes.map(async (recipe) => {
  const png = await renderPreview(recipe, "front");
  return pdf.embedPng(png);
}));
const backPng = await renderPreview(recipes[0], "back");
const back = await pdf.embedPng(backPng);
for (const side of ["front", "back"]) {
  const page = pdf.addPage([612, 792]);
  // Both columns contain recipes 1-5 from top to bottom. Mirrored back
  // columns align when printing portrait sheets with a long-edge flip.
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 2; column++) {
      const printedColumn = side === "back" ? 1 - column : column;
      page.drawImage(side === "front" ? fronts[row] : back, {
        x: left + printedColumn * cardWidth,
        y: bottom + (4 - row) * cardHeight,
        width: cardWidth, height: cardHeight,
      });
    }
  }
  for (let column = 0; column <= 2; column++) {
    const x = left + column * cardWidth;
    for (const y of [bottom - 11, 792 - bottom + 2]) {
      page.drawLine({ start: { x, y }, end: { x, y: y + 9 }, thickness: 0.5, color: ink });
    }
  }
  for (let row = 0; row <= 5; row++) {
    const y = bottom + row * cardHeight;
    for (const x of [left - 11, 612 - left + 2]) {
      page.drawLine({ start: { x, y }, end: { x: x + 9, y }, thickness: 0.5, color: ink });
    }
  }
}
const bytes = await pdf.save();
for (const directory of ["../output/pdf/", "../public/downloads/"]) {
  const folder = new URL(directory, import.meta.url);
  await mkdir(folder, { recursive: true });
  const target = new URL("jellys-lab-coffee-tea-recipes.pdf", folder);
  await writeFile(target, bytes);
  console.log(fileURLToPath(target));
}
console.log(`${recipes.length} recipes x 2 copies = 10 double-sided cards, ${pages} pages, ${bytes.length} bytes`);
