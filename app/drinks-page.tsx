"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_COOKIE, type CollectionTheme, type ThemeName } from "./theme";
import { Card3D } from "./card/studio";
import { MatchaGarden } from "./matcha-garden";
import { CARD_SIZE, cardDataUrl } from "./card/artwork";
import { CARD_RECIPES, FEATURED_CARD_INDEX, type CardRecipe } from "./card/recipes";
import { playMenu, playPaper, playTheme, setAudioEnabled, unlockAudio } from "./sound";

type SectionId = "about" | "drinks" | "toppings" | "appetizers" | "sauces" | "food" | "cocktails" | "mocktails" | "card";
const collectionSectionIds: Record<CollectionTheme, SectionId[]> = {
  spring: ["about", "drinks", "toppings", "card"],
  butter: ["about", "appetizers", "sauces", "food", "card"],
  blueberry: ["about", "cocktails", "mocktails", "card"],
};

type Recipe = {
  id: string; number: string; name: string; kind: "Tea" | "Coffee" | "Cocoa" | "Topping" | "Appetizer" | "Sauce" | "Food" | "Cocktail" | "Mocktail"; typeLabel?: string; folder?: string;
  description: string; image?: string; time: string; yield: string; lastMade?: string; tag?: string;
  ingredients: string[]; ingredientGroups?: { title: string; items: string[] }[];
  method: string[]; note?: string; variations?: string[];
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
    id: "basic-matcha-latte", number: "01", name: "Go-to Basic Matcha Latte", kind: "Tea", typeLabel: "Matcha",
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
    id: "lemon-tea-batch", number: "02", name: "Lemon tea (batch)", kind: "Tea",
    description: "Brewed tea and lemon syrup, chilled for a party.",
    time: "Not specified", yield: "about 1 L",
    ingredients: ["850 g brewed black, oolong, or jasmine green tea", "270 g lemon syrup (see Lemon syrup)", "Ice cubes"],
    method: ["Brew the tea, or use Ito En bottled tea.", "Mix 270 g lemon syrup into the tea.", "Chill and serve over ice."],
    variations: ["Adjust syrup to taste and to the tea used. Black tea may need more syrup.", "For one cup, use 30 g lemon syrup, 120 g tea, and 1 lemon slice."],
  },
  {
    id: "lemon-matcha", number: "03", name: "Lemon matcha", kind: "Tea", typeLabel: "Matcha",
    description: "Lemon syrup beneath a layer of matcha.",
    time: "Not specified", yield: "1 glass",
    ingredients: ["35–40 g lemon syrup (see Lemon syrup)", "80 g water", "3 g matcha powder", "60 g warm water", "Ice cubes"],
    method: ["Whisk matcha with 60 g warm water until smooth and frothy.", "In a serving glass, stir the lemon syrup with 80 g water.", "Fill with ice, then slowly pour matcha over the ice. Stir well before drinking."],
  },
  {
    id: "salted-maple-matcha-latte", number: "04", name: "Salted maple cream top matcha latte", kind: "Tea", typeLabel: "Matcha",
    description: "Maple matcha latte finished with salted maple cream.",
    time: "Not specified", yield: "1 latte",
    ingredientGroups: [
      { title: "Salted maple cream top", items: ["4 tbsp heavy whipping cream", "1/4 tsp sea salt", "3 tbsp milk", "2 tsp maple syrup"] },
      { title: "Matcha latte", items: ["3 g matcha", "30 g water at 170°F", "2–3 tsp maple syrup (use 2 tsp when whisking)", "90–100 g milk", "Ice (optional)"] },
    ],
    ingredients: [],
    method: ["Combine the cream, sea salt, milk, and maple syrup. Froth until cream-textured and set aside.", "Sift matcha into a bowl or mug. Add 170°F water and 2 tsp maple syrup; whisk until smooth and frothy.", "Fill a glass with ice and add the milk.", "Pour the matcha over the milk.", "Spoon 20–30 g salted maple cream top over the latte and serve."],
    note: "The topping also has its own recipe; adjust the amount to taste.",
  },
  {
    id: "salted-cheese-cocoa", number: "05", name: "Salted cheese cocoa", kind: "Cocoa",
    description: "Cocoa and condensed milk topped with salted cheese foam v1.0.",
    time: "Not specified", yield: "1 glass",
    ingredients: ["80 ml unsweetened milk", "20 ml condensed milk (about 1 tbsp)", "7 g cocoa powder", "50 ml hot water", "Salt, to taste", "30 g salted cheese foam v1.0 (see topping recipe)"],
    method: ["Whisk cocoa powder with hot water until smooth.", "Stir in the unsweetened milk and condensed milk.", "Add a pinch of salt and adjust to taste.", "Top with 30 g salted cheese foam v1.0."],
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
    note: "Add 10–15 ml to an iced drink and adjust to taste.",
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
  {
    id: "lemon-syrup", number: "04", name: "Lemon syrup", kind: "Topping", folder: "topping",
    description: "Brown sugar, lemon peel, and fresh lemon juice.",
    time: "3–4 hr steep + 25–35 min cook", yield: "about 500 ml", tag: "Make ahead",
    ingredients: ["800 g lemons", "About 192 g lemon peel, from the lemons", "400 g brown sugar", "A pinch of salt"],
    method: ["Rub lemons with salt to remove wax and dirt. Rinse and pat dry.", "Peel the lemons, aiming for about 192 g yellow peel. Avoid the white pith.", "Massage brown sugar and a pinch of salt into the peels. Marinate for 3–4 hours.", "Juice the peeled lemons (about 200 ml juice) and refrigerate the juice.", "Transfer peels and extracted syrup to a pot. Simmer gently over low heat for about 10 minutes, then remove the peels.", "Let the syrup cool slightly to 70–80°C (158–176°F). Stir in the reserved lemon juice and simmer on low for about 10 minutes, skimming bubbles from the top.", "Cool completely, transfer to an airtight container, and refrigerate."],
    variations: ["Add 80 g honey for a more honeyed flavor.", "Use in lemon tea or lemon matcha."],
  },
  {
    id: "salted-maple-cream-top", number: "05", name: "Salted maple cream top", kind: "Topping", folder: "topping",
    description: "A pourable maple cream topping for matcha.",
    time: "Not specified", yield: "Not specified",
    ingredients: ["4 tbsp heavy whipping cream", "1/4 tsp sea salt", "3 tbsp milk", "2 tsp maple syrup"],
    method: ["Combine the heavy whipping cream, sea salt, milk, and maple syrup.", "Froth until cream-textured."],
    note: "Use as a topping for salted maple cream top matcha latte.",
  },
  {
    id: "salted-cheese-foam-v1", number: "06", name: "Salted cheese foam v1.0", kind: "Topping", folder: "topping",
    description: "The cheese foam variation with Laughing Cow cheese.",
    time: "15 min", yield: "3 servings", tag: "Quick",
    ingredientGroups: [
      { title: "Cream cheese part", items: ["2 oz (about 50 g) cream cheese, softened", "1 block Laughing Cow cheese", "2 tbsp (about 26 g) heavy cream", "1 tbsp (about 10 g) sugar"] },
      { title: "Heavy cream part", items: ["2/3 cup (about 138 g) heavy cream", "2 tbsp (about 27 g) sugar", "1 tsp (about 3 g) sea salt", "1/2 tsp (about 1.5 g) vanilla"] },
    ],
    ingredients: ["About 1/4 cup (60 g) milk, plus 1–2 tbsp as needed"],
    method: ["Whisk softened cream cheese, Laughing Cow cheese, 2 tbsp heavy cream, and 1 tbsp sugar until smooth.", "In another bowl, whisk 2/3 cup heavy cream with 2 tbsp sugar, salt, and vanilla to soft peaks.", "Fold the cheese mixture into the softly whipped cream.", "Add about 1/4 cup milk, then more as needed, until the foam pours off a spoon."],
    note: "Do not overmix; the foam should stay pourable.",
  },
  {
    id: "osmanthus-syrup", number: "07", name: "Osmanthus syrup", kind: "Topping", folder: "topping",
    description: "Floral rock sugar syrup with tangerine.",
    time: "25–35 min + cooling", yield: "Not specified", tag: "Make ahead",
    ingredients: ["7 g dried osmanthus flowers", "200 ml water", "200 g rock sugar", "Juice of 1/2 tangerine", "A few strips of tangerine peel"],
    method: ["Lightly rinse the dried osmanthus and reserve the flowers.", "Bring water to a boil, add osmanthus, reduce heat, and simmer for 10–15 minutes.", "Strain, reserving the flowers. Return the infused water to the pot and bring back to a boil.", "Add rock sugar. Gently swirl the pot without stirring until it dissolves.", "Add tangerine juice and peel. Reduce heat to low and simmer for 15–20 minutes.", "Continue simmering until the syrup is slightly thinner than desired; it thickens as it cools.", "Remove from heat, stir the reserved flowers back in, and cool.", "Transfer to an airtight container and refrigerate."],
    note: "Swirl rather than stir to help keep the syrup clear.",
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

// The decorative 3D stack is a small preview; every recipe stays available in the notebook.
const MAX_STACK_CARDS = 3;
const collectionCards: Record<CollectionTheme, CardRecipe[]> = {
  spring: CARD_RECIPES.filter((card) => [...drinks, ...toppings].some((recipe) => recipe.id === card.id)).slice(0, MAX_STACK_CARDS),
  butter: CARD_RECIPES.filter((card) => [...appetizers, ...sauces, ...food].some((recipe) => recipe.id === card.id)).slice(0, MAX_STACK_CARDS),
  blueberry: CARD_RECIPES.filter((card) => [...cocktails, ...mocktails].some((recipe) => recipe.id === card.id)).slice(0, MAX_STACK_CARDS),
};

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

function RecipeEntry({ recipe, isOpen, onSelect }: { recipe: Recipe; isOpen: boolean; onSelect: (recipe: Recipe | null) => void }) {
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
    </article>}
  </div>;
}

export default function DrinksPage({ initialTheme }: { initialTheme: CollectionTheme }) {
  const [theme, setTheme] = useState<CollectionTheme>(initialTheme);
  const [filter, setFilter] = useState<"All" | "Tea" | "Cocoa">("All");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const visibleDrinks = drinks.filter((drink) => filter === "All" || drink.kind === filter);
  const studioCards = collectionCards[theme];
  const featuredIndex = theme === "spring" ? FEATURED_CARD_INDEX : 0;
  const featuredCard = studioCards[featuredIndex];
  const visibleSectionIds = collectionSectionIds[theme];
  const visibleExtraSections = theme === "butter" ? foodSections : theme === "blueberry" ? cocktailSections : [];
  const recipeCount = theme === "spring" ? drinks.length + toppings.length : theme === "butter" ? appetizers.length + sauces.length + food.length : cocktails.length + mocktails.length;

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
        <nav className="sidebar-nav" aria-label="Main navigation">{visibleSectionIds.map((id) => <a key={id} href={`#${id}`} className={activeSection === id ? "current" : undefined} aria-current={activeSection === id ? "location" : undefined}>{activeSection === id ? "> " : ""}{id === "drinks" ? "coffee/tea" : id}</a>)}</nav>
        <div className="theme-picker">
          <div className="sidebar-label">COLLECTION / <span>{themes.find((option) => option.id === theme)?.label}</span></div>
          <div className="theme-options" role="group" aria-label="Recipe collection">{themes.map((option) => <button key={option.id} type="button" hidden={option.id !== "spring"} className={theme === option.id ? "theme-option active" : "theme-option"} onClick={() => chooseTheme(option.id)} aria-label={`${option.name}, ${option.label} theme`} aria-pressed={theme === option.id} title={`${option.name} · ${option.label}`}>
            <span className="theme-swatch" style={{ background: option.id === "spring" ? `linear-gradient(90deg, ${option.colors[0]} 0%, ${option.colors[2]} 50%, ${option.colors[3]} 100%)` : option.colors[0], color: option.colors[1], borderColor: option.colors[1] }}><i style={{ background: option.colors[2] }} /><i style={{ background: option.colors[3] }} /></span><span className="theme-name">{option.name}<small>{option.label}</small></span>
          </button>)}</div>
        </div>
        <div className="sound-setting"><span className="sidebar-label">SOUND</span><button type="button" className="sound-toggle" aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"} aria-pressed={soundEnabled} title={soundEnabled ? "Mute sounds" : "Enable sounds"} onClick={toggleSound}><span aria-hidden="true">♪</span> {soundEnabled ? "on" : "off"}</button></div>
        <div className="visit-count" aria-live="polite"><span>VISITS</span><strong>{visitCount === null ? "------" : String(visitCount).padStart(6, "0")}</strong></div>
        <div className="sidebar-bottom">{recipeCount} recipes in {themes.find((option) => option.id === theme)?.name}<br />last note: keep experimenting</div>
      </aside>

      <main className={`main-content${theme === "spring" ? " illustrated-notebook" : ""}`}>
        <section id="about" className="about about-first" aria-label="About this collection">
          {theme === "spring" ? <>
            <div className="notebook-intro">
              <div><span className="section-label">FOR SLOW MORNINGS & LITTLE BREAKS</span><h1>coffee and tea</h1></div>
            </div>
            <MatchaGarden />
          </> : <div className="about-hero"><div className="about-copy"><span className="section-label">ABOUT.TXT / {themes.find((option) => option.id === theme)?.label.toUpperCase()}</span><h1>{theme === "butter" ? "food log" : "drink log"}<span className="cursor">_</span></h1><p>{theme === "butter" ? "Appetizers, sauces, and food worth making again." : "Cocktails and mocktails for whatever the occasion calls for."}</p><div className="about-ascii" aria-hidden="true">{theme === "butter" ? "[ appetizer ] + [ sauce ] + [ food ]" : "[ cocktail ] + [ mocktail ] = ✦"}</div></div><div className="collection-hero-mark" aria-hidden="true"><span>{theme === "butter" ? "✳" : "✦"}</span><small>{theme === "butter" ? "made to share" : "cheers to that"}</small></div></div>}
        </section>

        {theme === "spring" && <><section id="drinks" className="recipe-section drink-list" aria-labelledby="drinks-title">
          <div className="section-heading chapter-heading"><span className="chapter-number" aria-hidden="true">01</span><div><span className="section-label">THE DAILY CUP</span><h2 id="drinks-title">Something to sip.</h2><p>Everyday favorites, with room to experiment.</p></div></div>
          <div className="chapter-recipes">
          <div className="list-header"><span>{String(visibleDrinks.length).padStart(2, "0")} RECIPES</span><div className="filters" role="group" aria-label="Filter drinks">{(["All", "Tea", "Cocoa"] as const).map((item) => <button type="button" key={item} onClick={() => { setFilter(item); setSelected(null); }} aria-pressed={filter === item}>{item.toLowerCase()}</button>)}</div></div>
          {visibleDrinks.map((drink) => <RecipeEntry key={drink.id} recipe={drink} isOpen={selected?.id === drink.id} onSelect={setSelected} />)}
          </div>
        </section>

        <section id="toppings" className="recipe-section topping-list" aria-labelledby="toppings-title">
          <div className="section-heading chapter-heading"><span className="chapter-number" aria-hidden="true">02</span><div><span className="section-label">THE FINISHING TOUCH</span><h2 id="toppings-title">A little extra.</h2><p>Foams, creams, and syrups to make it yours.</p></div></div>
          <div className="chapter-recipes">
          <div className="list-header"><span>{String(toppings.length).padStart(2, "0")} RECIPES</span></div>
          <div className="topping-recipes">
            {toppings.map((topping) => <RecipeEntry key={topping.id} recipe={topping} isOpen={selected?.id === topping.id} onSelect={setSelected} />)}
          </div></div>
        </section></>}
        {visibleExtraSections.map((section) => <section key={section.id} id={section.id} className="recipe-section" aria-labelledby={`${section.id}-title`}>
          <div className="section-heading"><span className="section-label">{section.title.toUpperCase()}.TXT</span><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.description}</p></div>
          <div className="list-header"><span>FILE NAME</span><span>{section.recipes.length} {section.recipes.length === 1 ? "FILE" : "FILES"}</span></div>
          {section.recipes.map((recipe) => <RecipeEntry key={recipe.id} recipe={recipe} isOpen={selected?.id === recipe.id} onSelect={setSelected} />)}
        </section>)}
        <section id="card" className="recipe-section home-card" aria-labelledby="card-title">
          <div className={`section-heading${theme === "spring" ? " chapter-heading" : ""}`}>{theme === "spring" && <span className="chapter-number" aria-hidden="true">03</span>}<div><span className="section-label">{theme === "spring" ? "FROM THE NOTEBOOK TO YOUR KITCHEN" : "CARD.TXT"}</span><h2 id="card-title">A recipe to keep.</h2><p>A little preview from the collection.</p></div></div>
          <Card3D theme={theme} recipes={studioCards} featuredIndex={featuredIndex} />
          <div className="home-card-preview">
            <div className="flat-grid">
              <figure><Image src={cardDataUrl(theme, featuredCard, "front")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt={`Recipe card front for ${featuredCard.title} with a small dog logo`} /><figcaption>FRONT / RECIPE {featuredCard.number}</figcaption></figure>
              <figure><Image src={cardDataUrl(theme, featuredCard, "back")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt="Recipe card back with the Jelly's Lab dog logo and name" /><figcaption>BACK / ORIGINAL MARK</figcaption></figure>
            </div>
          </div>
        </section>
        <footer><span>© jelly&apos;s lab</span><a href="#top">back to top ↑</a></footer>
      </main>
    </div>

  </>;
}
