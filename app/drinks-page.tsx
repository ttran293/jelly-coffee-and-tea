"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_COOKIE, type CollectionTheme, type ThemeName } from "./theme";
import { Card3D } from "./card/studio";
import { HeroCup } from "./hero-cup";
import { CARD_SIZE, cardDataUrl } from "./card/artwork";
import { cardPngDataUrl } from "./card/download";
import { CARD_RECIPES, FEATURED_CARD_INDEX, MAX_PRINT_CARDS, type CardRecipe } from "./card/recipes";
import { playMenu, playPaper, playTheme, setAudioEnabled, unlockAudio } from "./sound";

const collectionCards: Record<CollectionTheme, CardRecipe[]> = {
  spring: CARD_RECIPES.slice(0, 3),
  butter: CARD_RECIPES.filter((recipe) => ["sesame-cucumber-bites", "lemon-herb-yogurt-sauce", "garlic-mushroom-toast"].includes(recipe.id)),
  blueberry: CARD_RECIPES.filter((recipe) => ["blueberry-gin-fizz", "blueberry-lime-spritz"].includes(recipe.id)),
};

function CardPngDownload({ theme, recipe, side }: { theme: ThemeName; recipe: CardRecipe; side: "front" | "back" }) {
  const [png, setPng] = useState<{ theme: ThemeName; recipeId: string; side: "front" | "back"; url: string } | null>(null);
  const url = png?.theme === theme && png.recipeId === recipe.id && png.side === side ? png.url : undefined;

  useEffect(() => {
    let active = true;
    void cardPngDataUrl(theme, recipe, side).then((dataUrl) => {
      if (active) setPng({ theme, recipeId: recipe.id, side, url: dataUrl });
    }).catch(() => {
      if (active) setPng({ theme, recipeId: recipe.id, side, url: "" });
    });
    return () => { active = false; };
  }, [theme, recipe, side]);

  const failed = png?.theme === theme && png.recipeId === recipe.id && png.side === side && png.url === "";
  return <a href={url || undefined} download={`jellys-lab-${theme}-${recipe.id}-${side}.png`} aria-disabled={!url}>{url ? "download PNG ↓" : failed ? "PNG unavailable" : "preparing PNG…"}</a>;
}

function CardSheetDownload({ theme, selectedIds, onDuplicate, onRemove, onClear }: { theme: ThemeName; selectedIds: string[]; onDuplicate: (id: string) => void; onRemove: (id: string) => void; onClear: () => void }) {
  const [backOffsetX, setBackOffsetX] = useState(0);
  const [backOffsetY, setBackOffsetY] = useState(0);
  const selection = `theme=${theme}&recipes=${selectedIds.join(",")}`;
  const backAlignment = `&offsetX=${backOffsetX}&offsetY=${backOffsetY}`;
  const offsetOptions = Array.from({ length: 21 }, (_, index) => (index - 10) / 2);
  const quantities = new Map<string, number>();
  selectedIds.forEach((id) => quantities.set(id, (quantities.get(id) ?? 0) + 1));
  return <div id="print-selection" className="card-sheet-download">
    <p>Add recipes as you browse. Use duplicate to print extra copies, then download separate front and back PDFs for single-sided cardstock.</p>
    <div className="card-sheet-review" aria-live="polite">
      <div className="card-sheet-review-head"><span>SELECTED {String(selectedIds.length).padStart(2, "0")} / {MAX_PRINT_CARDS}</span>{selectedIds.length > 0 && <button type="button" onClick={onClear}>clear all</button>}</div>
      {selectedIds.length === 0 ? <p>No recipes selected yet. Open a recipe and choose “add to print”.</p> : <ol>{[...quantities].map(([id, quantity]) => { const recipe = CARD_RECIPES.find((card) => card.id === id); return recipe && <li key={id}><span className="card-sheet-recipe-name">{recipe.title}{quantity > 1 && <strong>x{quantity}</strong>}</span><div className="card-sheet-review-actions"><button type="button" onClick={() => onDuplicate(id)} disabled={selectedIds.length >= MAX_PRINT_CARDS} aria-label={`Add another copy of ${recipe.title}`}>duplicate +</button><button type="button" onClick={() => onRemove(id)} aria-label={`Remove one copy of ${recipe.title}`}>remove ×</button></div></li>; })}</ol>}
    </div>
    {selectedIds.length > 0 && <p className="card-sheet-count">{selectedIds.length} {selectedIds.length === 1 ? "card" : "cards"} · 1 sheet per PDF</p>}
    <div className="card-sheet-buttons">
      <a href={selectedIds.length ? `/api/card-sheet?side=front&${selection}` : undefined} aria-disabled={!selectedIds.length} download>download fronts PDF ↓<small>3.5 × 2 in · up to 10 per Letter sheet</small></a>
      <a href={selectedIds.length ? `/api/card-sheet?side=back&${selection}${backAlignment}` : undefined} aria-disabled={!selectedIds.length} download>download backs PDF ↓<small>3.5 × 2 in · same card count</small></a>
    </div>
    <fieldset className="card-back-alignment">
      <legend>back alignment / mm</legend>
      <div className="card-back-alignment-controls">
        <label>Left / right <select value={backOffsetX} onChange={(event) => setBackOffsetX(Number(event.target.value))}>{offsetOptions.map((offset) => <option key={offset} value={offset}>{offset > 0 ? `+${offset}` : offset}</option>)}</select></label>
        <label>Up / down <select value={backOffsetY} onChange={(event) => setBackOffsetY(Number(event.target.value))}>{offsetOptions.map((offset) => <option key={offset} value={offset}>{offset > 0 ? `+${offset}` : offset}</option>)}</select></label>
      </div>
      <p>Use this for a consistent shift on every back. Negative moves left or up; positive moves right or down. Test one sheet at 100% size.</p>
    </fieldset>
  </div>;
}
type SectionId = "about" | "drinks" | "toppings" | "appetizers" | "sauces" | "food" | "cocktails" | "mocktails" | "card";
const collectionSectionIds: Record<CollectionTheme, SectionId[]> = {
  spring: ["about", "drinks", "toppings", "card"],
  butter: ["about", "appetizers", "sauces", "food", "card"],
  blueberry: ["about", "cocktails", "mocktails", "card"],
};

type Recipe = {
  id: string; number: string; name: string; kind: "Tea" | "Coffee" | "Topping" | "Appetizer" | "Sauce" | "Food" | "Cocktail" | "Mocktail"; typeLabel?: string; folder?: string;
  description: string; image?: string; time: string; yield: string; lastMade?: string; tag?: string;
  ingredients: string[]; ingredientGroups?: { title: string; items: string[] }[];
  method: string[]; note?: string; variations?: string[]; sample?: boolean;
};

const themes: { id: CollectionTheme; label: string; name: string; colors: string[] }[] = [
  { id: "spring", label: "Spring Mist", name: "coffee/tea", colors: ["#ffffff", "#263b5c", "#e0ffc9", "#cbd7fe"] },
  { id: "butter", label: "Butter Paper", name: "food", colors: ["#f4ebcf", "#292c3e", "#ae3854", "#2c7091"] },
  { id: "blueberry", label: "Blueberry", name: "drinks", colors: ["#232841", "#fbf3e5", "#a8d9f0", "#f3ae91"] },
];

function applyTheme(choice: CollectionTheme) {
  document.documentElement.dataset.theme = choice;
}

function saveThemeCookie(choice: CollectionTheme) {
  document.cookie = `${THEME_COOKIE}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

const drinks: Recipe[] = [
  {
    id: "strawberry-matcha", number: "01", name: "Strawberry cloud matcha", kind: "Tea",
    description: "Strawberries, jam, matcha, milk.", image: "/strawberry-matcha-latte.png",
    time: "8 min", yield: "1 glass",
    ingredients: ["3 fresh strawberries (about 45 g)", "12 g strawberry jam", "2 g matcha powder", "30 ml warm water (about 80°C / 176°F)", "150 ml cold milk of choice", "40 ml cold vanilla cream or sweet foam", "Ice"],
    method: ["Mash the strawberries with the jam in the bottom of a tall glass.", "Whisk matcha with warm water until smooth and lightly foamy.", "Fill the glass with ice, then pour in the milk.", "Slowly add the matcha. Spoon the vanilla cream on top and serve right away."],
    note: "12 g jam worked. Next time: try 6 g and see if the layers still hold.", sample: true,
  },
  {
    id: "honey-oat-espresso", number: "02", name: "Honey oat espresso", kind: "Coffee",
    description: "Espresso, honey, oat milk, a pinch of salt.", image: "/honey-oat-espresso.png",
    time: "5 min", yield: "1 glass",
    ingredients: ["1 double espresso (about 36 g)", "12 g honey", "150 ml chilled oat milk", "A tiny pinch of flaky salt", "Ice"],
    method: ["Stir the honey and salt into the hot espresso until dissolved.", "Fill a short glass with ice and add the oat milk.", "Pour the espresso over the milk. Give it one gentle stir before sipping."],
    note: "We keep forgetting the salt. It makes a difference. Darker espresso next time?", sample: true,
  },
  {
    id: "basic-matcha-latte", number: "03", name: "Go-to Basic Matcha Latte", kind: "Tea", typeLabel: "Matcha",
    description: "Matcha, milk, syrup if wanted.",
    time: "5–10 min", yield: "1 glass", lastMade: "September 7, 2026",
    ingredients: [],
    ingredientGroups: [
      { title: "Matcha (ratio 1:10:30)", items: ["3 g matcha", "30 g water at 175°F", "90–100 ml milk of choice"] },
      { title: "To assemble", items: ["Ice (optional)", "1 tsp syrup of choice"] },
    ],
    method: [
      "Whisk the matcha: Sift matcha into a bowl or mug, add hot water, and whisk until smooth and frothy.",
      "Build the drink: Fill a glass with ice. Add syrup if using, then add milk.",
      "Add matcha: Pour the matcha over the milk.",
      "Serve: Stir before drinking (or sip layered).",
    ],
    variations: [
      "For a stronger matcha flavor, increase matcha or use less milk.",
      "Ratio 1:10:30 means 1 g matcha, 10 ml water, 30 ml milk. Multiply as needed.",
    ],
  },
  {
    id: "brown-sugar-hojicha", number: "04", name: "Iced brown sugar hojicha", kind: "Tea", typeLabel: "Hojicha",
    description: "Roasted tea, oat milk, brown sugar.",
    time: "5 min", yield: "1 glass",
    ingredients: ["1 tsp hojicha powder", "60 ml warm water (80°C / 175°F or cooler)", "180 ml chilled oat milk", "10–15 ml brown sugar syrup (recipe below)", "Ice"],
    method: [
      "Whisk the hojicha powder with a splash of the warm water until smooth. Add the remaining water and whisk again.",
      "Add brown sugar syrup to a glass, then fill it with ice and pour in the oat milk.",
      "Pour the hojicha over the milk. Stir before drinking, adding a little more syrup if needed.",
    ],
    note: "A little water first keeps the powder from clumping.",
  },
  {
    id: "orange-espresso-tonic", number: "05", name: "Orange espresso tonic", kind: "Coffee",
    description: "Bright orange, cold tonic, espresso.",
    time: "5 min", yield: "1 glass",
    ingredients: ["1 espresso shot (about 35–40 ml)", "120 ml chilled tonic water", "15 ml fresh orange juice", "A strip of orange peel", "Ice"],
    method: [
      "Fill a tall glass with ice. Add the chilled tonic water and orange juice.",
      "Pull the espresso into a separate cup, then pour it slowly over the ice to make a dark top layer.",
      "Twist the orange peel over the glass and drop it in. Give the drink a gentle stir before sipping.",
    ],
    note: "Keep the tonic cold and pour slowly so the bubbles stay lively.",
  },
];

const toppings: Recipe[] = [
  {
    id: "salted-cheese-foam", number: "01", name: "Salted cheese foam", kind: "Topping", folder: "topping",
    description: "Cream cheese, whipped cream, a little salt.",
    time: "15 min", yield: "3 servings", tag: "Quick",
    ingredientGroups: [
      { title: "Cream cheese part", items: ["2 oz (4 tbsp) cream cheese, softened", "2 tbsp heavy cream", "1 tbsp sugar"] },
      { title: "Heavy cream part", items: ["2/3 cup heavy cream", "2 tbsp sugar", "1 tsp sea salt", "1/2 tsp vanilla"] },
    ],
    ingredients: ["About 1/4 cup milk (plus 1–2 tbsp as needed)"],
    method: [
      "Whisk the softened cream cheese, 2 tbsp heavy cream, and 1 tbsp sugar until very smooth.",
      "In another bowl, whisk 2/3 cup heavy cream with 2 tbsp sugar, salt, and vanilla until soft and airy (soft peaks).",
      "Fold the cream cheese mixture into the softly whipped cream.",
      "Add about 1/4 cup milk, and a little more as needed, until the foam pours off a spoon.",
    ],
    variations: [
      "Add 1 tbsp cream cheese if desired.",
      "Don't overmix the foam. It should pour off a spoon.",
    ],
  },
  {
    id: "brown-sugar-syrup", number: "02", name: "Brown sugar syrup", kind: "Topping", folder: "topping",
    description: "A quick caramel-like sweetener for tea and coffee.",
    time: "10 min + cooling", yield: "about 150 ml", tag: "Make ahead",
    ingredients: ["100 g dark brown sugar", "100 ml water", "A tiny pinch of salt (optional)"],
    method: [
      "Add the brown sugar and water to a small saucepan. Warm over medium-low heat, stirring until the sugar dissolves.",
      "Let it bubble gently for 1–2 minutes, then take it off the heat and stir in the salt if using.",
      "Cool completely before adding to an iced drink. Start with 10–15 ml per glass and adjust to taste.",
    ],
    note: "Try it in the iced hojicha latte above.",
  },
  {
    id: "vanilla-cold-foam", number: "03", name: "Vanilla cold foam", kind: "Topping", folder: "topping",
    description: "Soft vanilla foam that pours over iced drinks.",
    time: "5 min", yield: "2 drinks", tag: "Quick",
    ingredients: ["60 ml cold heavy cream", "30 ml cold milk", "10 ml vanilla syrup", "A tiny pinch of salt"],
    method: [
      "Combine the cold cream, milk, vanilla syrup, and salt in a tall cup or small frothing pitcher.",
      "Froth with a handheld frother for 15–25 seconds, just until thickened but still pourable.",
      "Spoon or pour over two iced drinks right away.",
    ],
    note: "Stop before it becomes whipped cream; it should settle gently on the drink.",
  },
];

const appetizers: Recipe[] = [
  {
    id: "sesame-cucumber-bites", number: "01", name: "Sesame cucumber bites", kind: "Appetizer", folder: "appetizer",
    description: "Crunchy cucumber, creamy yogurt, toasted sesame.",
    time: "15 min", yield: "12 bites", tag: "Starter recipe",
    ingredients: ["1 large cucumber", "1/2 cup thick plain Greek yogurt", "1 tsp lemon juice", "1 tsp toasted sesame oil", "1 tsp sesame seeds", "A pinch of salt", "Chili flakes and chopped scallions, optional"],
    method: [
      "Slice the cucumber into 12 thick rounds and pat the cut sides dry.",
      "Stir the yogurt with lemon juice, sesame oil, and salt.",
      "Spoon a little yogurt onto each cucumber round. Sprinkle with sesame seeds, and add chili flakes or scallions if you like.",
      "Serve right away so the cucumber stays crisp.",
    ],
    note: "A simple starting point for the appetizer folder; adjust the topping to taste.",
  },
];

const sauces: Recipe[] = [
  {
    id: "lemon-herb-yogurt-sauce", number: "01", name: "Lemon herb yogurt sauce", kind: "Sauce", folder: "sauce",
    description: "A bright spoonable sauce for vegetables, wraps, and bowls.",
    time: "10 min", yield: "about 3/4 cup", tag: "Starter recipe",
    ingredients: ["3/4 cup plain Greek yogurt", "1 tbsp lemon juice", "1 tbsp finely chopped dill or parsley", "1 small garlic clove, grated", "1 tbsp water, plus more as needed", "Salt and black pepper"],
    method: [
      "Stir the yogurt, lemon juice, herbs, and garlic together in a small bowl.",
      "Add water a little at a time until the sauce is as thick or pourable as you like.",
      "Season with salt and pepper. Taste and add more lemon if needed.",
    ],
    note: "Start with a little garlic; its flavor gets stronger as the sauce sits.",
  },
];

const food: Recipe[] = [
  {
    id: "garlic-mushroom-toast", number: "01", name: "Garlic mushroom toast", kind: "Food", folder: "food",
    description: "Golden mushrooms on warm, crunchy toast.",
    time: "20 min", yield: "2 toasts", tag: "Starter recipe",
    ingredients: ["2 thick slices of bread", "200 g mushrooms, sliced", "1 tbsp olive oil", "1 small garlic clove, minced", "1 tsp butter", "1 tsp lemon juice", "Salt and black pepper", "Chopped parsley, optional"],
    method: [
      "Toast the bread until golden and set it aside.",
      "Heat olive oil in a skillet over medium-high heat. Add mushrooms in one layer and cook for 5–7 minutes, stirring occasionally, until browned and their moisture has cooked off.",
      "Lower the heat. Stir in garlic and butter, and cook for about 1 minute until fragrant. Add lemon juice, salt, and pepper.",
      "Spoon the mushrooms over the toast and finish with parsley if using. Serve warm.",
    ],
    note: "Give the mushrooms room in the pan so they brown instead of steam.",
  },
];

const cocktails: Recipe[] = [
  {
    id: "blueberry-gin-fizz", number: "01", name: "Blueberry gin fizz", kind: "Cocktail", folder: "cocktail",
    description: "Blueberries, lemon, gin, and a sparkling finish.",
    time: "8 min", yield: "1 glass", tag: "Starter recipe",
    ingredients: ["8 fresh blueberries", "45 ml gin", "20 ml fresh lemon juice", "15 ml simple syrup", "60 ml chilled sparkling water", "Ice", "Lemon slice, optional"],
    method: [
      "Muddle the blueberries with the lemon juice and simple syrup in a shaker.",
      "Add gin and ice. Shake until cold, then strain into a glass filled with fresh ice.",
      "Top with sparkling water and garnish with lemon if you like.",
    ],
    note: "Taste the berries first; use a little less syrup when they are very sweet.",
  },
];

const mocktails: Recipe[] = [
  {
    id: "blueberry-lime-spritz", number: "01", name: "Blueberry lime spritz", kind: "Mocktail", folder: "mocktail",
    description: "A bright, bubbly blueberry drink without alcohol.",
    time: "7 min", yield: "1 glass", tag: "Starter recipe",
    ingredients: ["10 fresh blueberries", "20 ml fresh lime juice", "15 ml simple syrup", "120 ml chilled sparkling water", "Ice", "Mint sprig, optional"],
    method: [
      "Muddle the blueberries with lime juice and simple syrup in a glass.",
      "Fill the glass with ice and pour in the sparkling water.",
      "Stir gently and garnish with mint if you like.",
    ],
    note: "Add sparkling water just before serving to keep the bubbles lively.",
  },
];

const foodSections = [
  { id: "appetizers", title: "appetizers", description: "Little things to start with.", recipes: appetizers },
  { id: "sauces", title: "sauces", description: "The extras that bring a plate together.", recipes: sauces },
  { id: "food", title: "food", description: "Something good to sit down with.", recipes: food },
] as const;

const cocktailSections = [
  { id: "cocktails", title: "cocktails", description: "A little something to raise a glass to.", recipes: cocktails },
  { id: "mocktails", title: "mocktails", description: "All the fun, without the spirits.", recipes: mocktails },
] as const;

let visitRequest: Promise<number | null> | null = null;

function RecipeEntry({ recipe, isOpen, onSelect, isPicked, printIsFull, onTogglePrint }: { recipe: Recipe; isOpen: boolean; onSelect: (recipe: Recipe | null) => void; isPicked?: boolean; printIsFull?: boolean; onTogglePrint?: (id: string) => void }) {
  return <div className="drink-entry">
    <button id={`drink-${recipe.id}`} type="button" className="drink-row" onClick={() => onSelect(isOpen ? null : recipe)} aria-expanded={isOpen} aria-controls={`recipe-${recipe.id}`} aria-label={`${isOpen ? "Hide" : "Read"} ${recipe.name} recipe`}>
      <span className="drink-number">{recipe.number} /</span><span className="drink-info"><strong>{recipe.name}</strong><small>{recipe.description}</small></span><span className="drink-kind">{(recipe.typeLabel ?? recipe.kind).toUpperCase()}</span><span className="row-arrow" aria-hidden="true">{isOpen ? "−" : "+"}</span>
    </button>
    {isOpen && <article id={`recipe-${recipe.id}`} className="recipe-sheet" role="region" aria-labelledby={`recipe-title-${recipe.id}`}>
      <div className="recipe-sheet-head"><span className="recipe-overline">~/jelly/{recipe.folder ?? "recipe"}-{recipe.number}.txt <span>·</span> {(recipe.typeLabel ?? recipe.kind).toUpperCase()}</span><button type="button" className="recipe-close" onClick={() => { onSelect(null); document.getElementById(`drink-${recipe.id}`)?.focus(); }}>close ×</button></div>
      <div className={recipe.image ? "recipe-lead" : "recipe-lead recipe-lead--text"}>{recipe.image && <div className="recipe-image"><Image src={recipe.image} alt={`${recipe.name} in a glass`} width={150} height={160} sizes="(max-width: 520px) 92px, 150px" /></div>}<div className="recipe-lead-copy"><h2 id={`recipe-title-${recipe.id}`} className="recipe-title">{recipe.name}</h2><p className="recipe-intro">{recipe.description}</p><div className="recipe-facts"><span>TIME <strong>{recipe.time}</strong></span><span>MAKES <strong>{recipe.yield}</strong></span>{recipe.lastMade && <span>LAST MADE <strong>{recipe.lastMade}</strong></span>}{recipe.tag && <span>TAG <strong>{recipe.tag}</strong></span>}</div></div></div>
      <div className="recipe-columns"><section><h3>What you&apos;ll need</h3>{recipe.ingredientGroups?.map((group) => <div className="recipe-ingredient-group" key={group.title}><h4>{group.title}</h4><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}{recipe.ingredients.length > 0 && <ul className={recipe.ingredientGroups ? "recipe-extra-ingredients" : undefined}>{recipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>}</section><section><h3>Make it</h3><ol>{recipe.method.map((step) => <li key={step}>{step}</li>)}</ol></section></div>
      {recipe.note && <p className="lab-note"><strong>Note:</strong> {recipe.note}</p>}
      {recipe.variations && <div className="lab-note"><strong>Notes / variations</strong><ul>{recipe.variations.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {recipe.sample && <p className="sample-label">[ sample recipe / version 01 ]</p>}
      {onTogglePrint && <div className="recipe-print-action"><button type="button" aria-pressed={isPicked} disabled={printIsFull && !isPicked} onClick={() => onTogglePrint(recipe.id)}>{isPicked ? "✓ added to print · remove" : printIsFull ? "print list full" : "+ add this recipe to print"}</button>{isPicked && <a href="#print-selection">view print selection ↓</a>}</div>}
    </article>}
  </div>;
}

export default function DrinksPage({ initialTheme }: { initialTheme: CollectionTheme }) {
  const [theme, setTheme] = useState<CollectionTheme>(initialTheme);
  const [filter, setFilter] = useState<"All" | "Tea" | "Coffee">("All");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [selectedCardsByTheme, setSelectedCardsByTheme] = useState<Record<CollectionTheme, string[]>>({ spring: [], butter: [], blueberry: [] });
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const visibleDrinks = drinks.filter((drink) => filter === "All" || drink.kind === filter);
  const selectedCardIds = selectedCardsByTheme[theme];
  const studioCards = collectionCards[theme];
  const featuredIndex = theme === "spring" ? FEATURED_CARD_INDEX : 0;
  const featuredCard = studioCards[featuredIndex];
  const visibleSectionIds = collectionSectionIds[theme];
  const visibleExtraSections = theme === "butter" ? foodSections : theme === "blueberry" ? cocktailSections : [];
  const recipeCount = theme === "spring" ? drinks.length + toppings.length : theme === "butter" ? appetizers.length + sauces.length + food.length : cocktails.length + mocktails.length;

  function updateSelectedCards(update: (current: string[]) => string[]) {
    setSelectedCardsByTheme((current) => ({ ...current, [theme]: update(current[theme]) }));
  }

  function togglePrintRecipe(id: string) {
    updateSelectedCards((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : current.length < MAX_PRINT_CARDS ? [...current, id] : current);
  }

  function duplicatePrintRecipe(id: string) {
    updateSelectedCards((current) => {
      const index = current.lastIndexOf(id);
      return current.length >= MAX_PRINT_CARDS || index === -1
        ? current
        : [...current.slice(0, index + 1), id, ...current.slice(index + 1)];
    });
  }

  function removePrintRecipe(id: string) {
    updateSelectedCards((current) => {
      const index = current.lastIndexOf(id);
      return index === -1 ? current : current.filter((_, cardIndex) => cardIndex !== index);
    });
  }

  useEffect(() => {
    const updateSection = () => {
      const readingLine = Math.min(window.innerHeight * 0.35, 280);
      let visibleSection: SectionId = "about";
      for (const id of collectionSectionIds[theme]) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= readingLine) visibleSection = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) visibleSection = "card";
      setActiveSection(visibleSection);
    };
    let frame = 0;
    const scheduleUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; updateSection(); });
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    scheduleUpdate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [theme]);

  useEffect(() => {
    let active = true;
    visitRequest ??= fetch("/api/visits", { method: "POST", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) return null;
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null || !("count" in data)) return null;
        const count = data.count;
        return typeof count === "number" && Number.isFinite(count) ? count : null;
      })
      .catch(() => null);
    visitRequest.then((count) => { if (active) setVisitCount(count); });
    return () => { active = false; };
  }, []);

  function chooseTheme(choice: CollectionTheme) {
    if (choice === theme) return;
    setTheme(choice);
    setSelected(null);
    setFilter("All");
    setActiveSection("about");
    applyTheme(choice);
    saveThemeCookie(choice);
    window.history.replaceState(null, "", `${location.pathname}${location.search}`);
    window.scrollTo(0, 0);
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setAudioEnabled(next);
    if (next) unlockAudio();
  }

  return <>
    <div className="site-shell" id="top" onPointerDownCapture={() => { if (soundEnabled) unlockAudio(); }} onKeyDownCapture={(event) => { if (soundEnabled && (event.key === "Enter" || event.key === " ")) unlockAudio(); }} onClickCapture={(event) => {
      if (!soundEnabled || !(event.target instanceof Element)) return;
      const control = event.target.closest("button, a");
      if (!control || control.classList.contains("sound-toggle")) return;
      if (control.matches(".drink-row, .recipe-close")) playPaper(0.7);
      else if (control.matches(".theme-option") && control.getAttribute("aria-pressed") !== "true") playTheme();
      else if (control.matches(".sidebar-nav a")) playMenu();
    }}>
      <aside className="sidebar">
        <div className="identity"><div className="dog-kaomoji" aria-hidden="true"><span>U・ᴥ・U</span><small>~ woof ~</small></div><a href="#top" className="site-name">jelly&apos;s lab</a></div>
        <nav className="sidebar-nav" aria-label="Main navigation">{visibleSectionIds.map((id) => <a key={id} href={id === "card" && selectedCardIds.length > 0 ? "#print-selection" : `#${id}`} className={activeSection === id ? "current" : undefined} aria-current={activeSection === id ? "location" : undefined}>{activeSection === id ? "> " : ""}{id === "drinks" ? "coffee/tea" : id}{id === "card" && selectedCardIds.length > 0 && <span className="nav-card-count"> ({selectedCardIds.length})</span>}</a>)}</nav>
        <div className="theme-picker">
          <div className="sidebar-label">COLLECTION / <span>{themes.find((option) => option.id === theme)?.label}</span></div>
          <div className="theme-options" role="group" aria-label="Recipe collection">{themes.map((option) => <button key={option.id} type="button" className={theme === option.id ? "theme-option active" : "theme-option"} onClick={() => chooseTheme(option.id)} aria-label={`${option.name}, ${option.label} theme`} aria-pressed={theme === option.id} title={`${option.name} · ${option.label}`}>
            <span className="theme-swatch" style={{ background: option.id === "spring" ? `linear-gradient(90deg, ${option.colors[0]} 0%, ${option.colors[2]} 50%, ${option.colors[3]} 100%)` : option.colors[0], color: option.colors[1], borderColor: option.colors[1] }}><i style={{ background: option.colors[2] }} /><i style={{ background: option.colors[3] }} /></span><span className="theme-name">{option.name}<small>{option.label}</small></span>
          </button>)}</div>
        </div>
        <div className="sound-setting"><span className="sidebar-label">SOUND</span><button type="button" className="sound-toggle" aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"} aria-pressed={soundEnabled} title={soundEnabled ? "Mute sounds" : "Enable sounds"} onClick={toggleSound}><span aria-hidden="true">♪</span> {soundEnabled ? "on" : "off"}</button></div>
        <div className="visit-count" aria-live="polite"><span>VISITS</span><strong>{visitCount === null ? "------" : String(visitCount).padStart(6, "0")}</strong></div>
        <div className="sidebar-bottom">{recipeCount} recipes in {themes.find((option) => option.id === theme)?.name}<br />last note: keep experimenting</div>
      </aside>

      <main className="main-content">
        <div className="path">~/jelly/index.txt</div>
        <section id="about" className="about about-first" aria-label="About this collection"><div className="about-hero"><div className="about-copy"><span className="section-label">ABOUT.TXT / {themes.find((option) => option.id === theme)?.label.toUpperCase()}</span><h1>{theme === "spring" ? "coffee/tea" : theme === "butter" ? "food log" : "drink log"}<span className="cursor">_</span></h1><p>{theme === "spring" ? "Coffee, tea, and the little extras that make a glass feel special." : theme === "butter" ? "Appetizers, sauces, and food worth making again." : "Cocktails and mocktails for whatever the occasion calls for."}</p><div className="about-ascii" aria-hidden="true">{theme === "spring" ? "[ coffee ] + [ tea ] = ♡" : theme === "butter" ? "[ appetizer ] + [ sauce ] + [ food ]" : "[ cocktail ] + [ mocktail ] = ✦"}</div></div>{theme === "spring" ? <HeroCup /> : <div className="collection-hero-mark" aria-hidden="true"><span>{theme === "butter" ? "✳" : "✦"}</span><small>{theme === "butter" ? "made to share" : "cheers to that"}</small></div>}</div></section>

        {theme === "spring" && <><section id="drinks" className="recipe-section drink-list" aria-labelledby="drinks-title">
          <div className="section-heading"><span className="section-label">COFFEE_TEA.TXT</span><h2 id="drinks-title">coffee/tea</h2><p className="testing-line"><span tabIndex={0}>What we are testing.</span></p></div>
          <div className="list-header"><span>FILE NAME</span><div className="filters" role="group" aria-label="Filter coffee and tea">{(["All", "Tea", "Coffee"] as const).map((item) => <button type="button" key={item} onClick={() => { setFilter(item); setSelected(null); }} aria-pressed={filter === item}>{item.toLowerCase()}</button>)}</div></div>
          {visibleDrinks.map((drink) => <RecipeEntry key={drink.id} recipe={drink} isOpen={selected?.id === drink.id} onSelect={setSelected} isPicked={selectedCardIds.includes(drink.id)} printIsFull={selectedCardIds.length >= MAX_PRINT_CARDS} onTogglePrint={togglePrintRecipe} />)}
          <p className="list-note">* recipes change when we make something better</p>
        </section>

        <section id="toppings" className="recipe-section topping-list" aria-labelledby="toppings-title">
          <div className="section-heading"><span className="section-label">TOPPINGS.TXT</span><h2 id="toppings-title">toppings</h2><p>The bits we put on top.</p></div>
          <div className="list-header"><span>FILE NAME</span><span>{toppings.length} {toppings.length === 1 ? "FILE" : "FILES"}</span></div>
          {toppings.map((topping) => <RecipeEntry key={topping.id} recipe={topping} isOpen={selected?.id === topping.id} onSelect={setSelected} isPicked={selectedCardIds.includes(topping.id)} printIsFull={selectedCardIds.length >= MAX_PRINT_CARDS} onTogglePrint={togglePrintRecipe} />)}
        </section></>}
        {visibleExtraSections.map((section) => <section key={section.id} id={section.id} className="recipe-section" aria-labelledby={`${section.id}-title`}>
          <div className="section-heading"><span className="section-label">{section.title.toUpperCase()}.TXT</span><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.description}</p></div>
          <div className="list-header"><span>FILE NAME</span><span>{section.recipes.length} {section.recipes.length === 1 ? "FILE" : "FILES"}</span></div>
          {section.recipes.map((recipe) => <RecipeEntry key={recipe.id} recipe={recipe} isOpen={selected?.id === recipe.id} onSelect={setSelected} isPicked={selectedCardIds.includes(recipe.id)} printIsFull={selectedCardIds.length >= MAX_PRINT_CARDS} onTogglePrint={togglePrintRecipe} />)}
        </section>)}
        <section id="card" className="recipe-section home-card" aria-labelledby="card-title">
          <div className="section-heading"><span className="section-label">CARD.TXT</span><h2 id="card-title">the little card</h2><p>Print it, punch it, save for later.</p></div>
          <Card3D theme={theme} recipes={studioCards} featuredIndex={featuredIndex} />
          <div className="home-card-print">
            <h3>print the card</h3>
            <CardSheetDownload theme={theme} selectedIds={selectedCardIds} onDuplicate={duplicatePrintRecipe} onRemove={removePrintRecipe} onClear={() => updateSelectedCards(() => [])} />
            <div className="card-print-settings">
              <h4>print settings / PDF</h4>
              <ul>
                <li><strong>Paper:</strong> US Letter (8.5 × 11 in), color, up to ten 3.5 × 2 in cards per sheet</li>
                <li><strong>Size:</strong> Actual Size / 100% — not Fit or Shrink</li>
                <li><strong>Sides:</strong> Print the front and back PDFs separately, each single-sided</li>
                <li><strong>Paper type:</strong> Cardstock, heavyweight, or matte, if your printer offers it</li>
                <li><strong>Feed:</strong> Use a manual or straight paper path if available; feed one cardstock sheet at a time</li>
              </ul>
            </div>
            <p className="home-card-print-note">Individual 5 × 3 in artwork · 1500 × 900 px PNG · {themes.find((option) => option.id === theme)?.label} colors · ⅛ in punch guide</p>
            <div className="flat-grid">
              <figure><Image src={cardDataUrl(theme, featuredCard, "front")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt={`Printable 5 by 3 inch recipe front for ${featuredCard.title} with a small dog logo`} /><figcaption><span>FRONT / RECIPE {featuredCard.number}</span><CardPngDownload theme={theme} recipe={featuredCard} side="front" /></figcaption></figure>
              <figure><Image src={cardDataUrl(theme, featuredCard, "back")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt="Printable 5 by 3 inch back with the Jelly's Lab dog logo and name" /><figcaption><span>BACK / ORIGINAL MARK</span><CardPngDownload theme={theme} recipe={featuredCard} side="back" /></figcaption></figure>
            </div>
            <p className="home-card-print-tip">Test one sheet from each PDF before printing the full set. Adjust the back only if every card is off by the same amount. Cut along the trim marks, then pair each front with a back.</p>
          </div>
        </section>
        <footer><span>© jelly&apos;s lab</span><a href="#top">back to top ↑</a></footer>
      </main>
    </div>

  </>;
}
