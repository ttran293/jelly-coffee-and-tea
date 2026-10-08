import { cardSheetPdf } from "../../card/print-sheet";
import { CARD_RECIPES, FEATURED_CARD_INDEX, MAX_PRINT_CARDS } from "../../card/recipes";
import { readTheme } from "../../theme";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;
  const side = parameters.get("side");
  if (side !== "front" && side !== "back") {
    return new Response("Choose front or back card sheet.", { status: 400 });
  }

  const theme = readTheme(parameters.get("theme") ?? undefined);
  const requestedIds = parameters.get("recipes")?.split(",") ?? [CARD_RECIPES[FEATURED_CARD_INDEX].id];
  const recipes = requestedIds.map((id) => CARD_RECIPES.find((recipe) => recipe.id === id));
  if (requestedIds.length < 1 || requestedIds.length > MAX_PRINT_CARDS || recipes.some((recipe) => !recipe)) {
    return new Response(`Choose 1 to ${MAX_PRINT_CARDS} valid recipe cards.`, { status: 400 });
  }

  const pdf = await cardSheetPdf(theme, recipes as typeof CARD_RECIPES, side);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="jelly-coffee-lab-${recipes.length}-cards-${side}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
