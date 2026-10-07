import { cardSheetPdf } from "../../card/print-sheet";
import { CARD_RECIPES, FEATURED_CARD_INDEX } from "../../card/recipes";
import { readTheme } from "../../theme";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;
  const size = parameters.get("size");
  if (size !== "business" && size !== "recipe") {
    return new Response("Choose business or recipe card size.", { status: 400 });
  }

  const theme = readTheme(parameters.get("theme") ?? undefined);
  const requestedIds = parameters.get("recipes")?.split(",") ?? [CARD_RECIPES[FEATURED_CARD_INDEX].id];
  const recipes = requestedIds.map((id) => CARD_RECIPES.find((recipe) => recipe.id === id));
  if (requestedIds.length < 1 || requestedIds.length > CARD_RECIPES.length || new Set(requestedIds).size !== requestedIds.length || recipes.some((recipe) => !recipe)) {
    return new Response("Choose one or more different recipes from the card list.", { status: 400 });
  }

  const pdf = await cardSheetPdf(theme, recipes as typeof CARD_RECIPES, size);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="jelly-coffee-lab-${recipes.length}-cards-${size}-duplex.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
