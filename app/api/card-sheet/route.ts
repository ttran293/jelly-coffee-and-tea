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
  const recipe = CARD_RECIPES[FEATURED_CARD_INDEX];
  const pdf = await cardSheetPdf(theme, recipe, size);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="jelly-coffee-lab-${recipe.id}-${size}-duplex.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
