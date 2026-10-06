import type { ThemeName } from "../theme";
import type { CardRecipe } from "./recipes";
import { cardDataUrl } from "./artwork";

const PNG_WIDTH = 1500;
const PNG_HEIGHT = 900;

export async function cardPngDataUrl(theme: ThemeName, recipe: CardRecipe, side: "front" | "back") {
  const image = new window.Image();
  image.src = cardDataUrl(theme, recipe, side);
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = PNG_WIDTH;
  canvas.height = PNG_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create PNG canvas");
  context.drawImage(image, 0, 0, PNG_WIDTH, PNG_HEIGHT);

  return canvas.toDataURL("image/png");
}
