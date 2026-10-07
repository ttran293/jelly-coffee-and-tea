"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_COOKIE, type ThemeName } from "./theme";
import { Card3D } from "./card/studio";
import { HeroCup } from "./hero-cup";
import { CARD_SIZE, cardDataUrl } from "./card/artwork";
import { cardPngDataUrl } from "./card/download";
import { CARD_RECIPES, FEATURED_CARD_INDEX } from "./card/recipes";
import { playMenu, playPaper, playTheme, setAudioEnabled, unlockAudio } from "./sound";

const featuredCard = CARD_RECIPES[FEATURED_CARD_INDEX];

function CardPngDownload({ theme, side }: { theme: ThemeName; side: "front" | "back" }) {
  const [png, setPng] = useState<{ theme: ThemeName; side: "front" | "back"; url: string } | null>(null);
  const url = png?.theme === theme && png.side === side ? png.url : undefined;

  useEffect(() => {
    let active = true;
    void cardPngDataUrl(theme, featuredCard, side).then((dataUrl) => {
      if (active) setPng({ theme, side, url: dataUrl });
    }).catch(() => {
      if (active) setPng({ theme, side, url: "" });
    });
    return () => { active = false; };
  }, [theme, side]);

  const failed = png?.theme === theme && png.side === side && png.url === "";
  return <a href={url || undefined} download={`jelly-coffee-lab-${theme}-${featuredCard.id}-${side}.png`} aria-disabled={!url}>{url ? "download PNG ↓" : failed ? "PNG unavailable" : "preparing PNG…"}</a>;
}

function CardSheetDownload({ theme, selectedIds, onToggle, onClear }: { theme: ThemeName; selectedIds: string[]; onToggle: (id: string) => void; onClear: () => void }) {
  const selection = `theme=${theme}&recipes=${selectedIds.join(",")}`;
  return <div id="print-selection" className="card-sheet-download">
    <p>Add recipes as you browse, then download the cards here. Each front is followed by its aligned back for double-sided printing.</p>
    <div className="card-sheet-review" aria-live="polite">
      <div className="card-sheet-review-head"><span>SELECTED / {String(selectedIds.length).padStart(2, "0")}</span>{selectedIds.length > 0 && <button type="button" onClick={onClear}>clear all</button>}</div>
      {selectedIds.length === 0 ? <p>No recipes selected yet. Open a recipe and choose “add to print”.</p> : <ol>{selectedIds.map((id) => { const recipe = CARD_RECIPES.find((card) => card.id === id); return recipe && <li key={id}><span>{recipe.title}</span><button type="button" onClick={() => onToggle(id)} aria-label={`Remove ${recipe.title} from print selection`}>remove ×</button></li>; })}</ol>}
    </div>
    {selectedIds.length > 0 && <p className="card-sheet-count">{selectedIds.length} {selectedIds.length === 1 ? "recipe" : "recipes"} · {Math.ceil(selectedIds.length / 10)} business {selectedIds.length <= 10 ? "sheet" : "sheets"} or {Math.ceil(selectedIds.length / 3)} larger {selectedIds.length <= 3 ? "sheet" : "sheets"}</p>}
    <div className="card-sheet-buttons">
      <a href={selectedIds.length ? `/api/card-sheet?size=business&${selection}` : undefined} aria-disabled={!selectedIds.length} download>download business card sheet ↓<small>3.5 × 2 in · up to 10 per Letter sheet</small></a>
      <a href={selectedIds.length ? `/api/card-sheet?size=recipe&${selection}` : undefined} aria-disabled={!selectedIds.length} download>download larger recipe sheet ↓<small>5 × 3 in · up to 3 per Letter sheet</small></a>
    </div>
  </div>;
}
const sectionIds = ["about", "drinks", "toppings", "card"] as const;

type Recipe = {
  id: string; number: string; name: string; kind: "Tea" | "Coffee" | "Topping"; typeLabel?: string; folder?: string;
  description: string; image?: string; time: string; yield: string; lastMade?: string; tag?: string;
  ingredients: string[]; ingredientGroups?: { title: string; items: string[] }[];
  method: string[]; note?: string; variations?: string[]; sample?: boolean;
};

const themes: { id: ThemeName; label: string; colors: string[] }[] = [
  { id: "butter", label: "Butter Paper", colors: ["#f4ebcf", "#292c3e", "#ae3854", "#2c7091"] },
  { id: "blueberry", label: "Blueberry", colors: ["#232841", "#fbf3e5", "#a8d9f0", "#f3ae91"] },
  { id: "cherry", label: "Cherry Cola", colors: ["#40252e", "#fff1df", "#ffb49d", "#f2d17c"] },
  { id: "lilac", label: "Lilac Screen", colors: ["#dedaf0", "#302d4a", "#6852af", "#b65475"] },
  { id: "cloud", label: "Cloud Wash", colors: ["#ffffff", "#263b5c", "#fff2c9", "#cbd7ef"] },
  { id: "blush", label: "Blush Sky", colors: ["#ffffff", "#263b5c", "#c9e0ff", "#fecbcc"] },
  { id: "spring", label: "Spring Mist", colors: ["#ffffff", "#263b5c", "#e0ffc9", "#cbd7fe"] },
  { id: "nightfall", label: "Nightfall", colors: ["#ffcee3", "#fff4f8", "#678ec9", "#262277"] },
  { id: "peach", label: "Peach Dusk", colors: ["#ffe28d", "#fff3e0", "#fac1a8", "#13193d"] },
  { id: "tidal", label: "Tidal", colors: ["#f9d2e4", "#f7fff9", "#67c9b5", "#007e79"] },
  { id: "garden", label: "Garden Glow", colors: ["#fedfcb", "#fff3e9", "#106816", "#fcc2eb"] },
];

const visibleThemes = themes.filter((option) => option.id === "blush" || option.id === "spring");
const gradientThemes = new Set<ThemeName>(["cloud", "blush", "spring", "nightfall", "peach", "tidal", "garden"]);

function applyTheme(choice: ThemeName) {
  document.documentElement.dataset.theme = choice;
}

function saveThemeCookie(choice: ThemeName) {
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

let visitRequest: Promise<number | null> | null = null;

function RecipeEntry({ recipe, isOpen, onSelect, isPicked, onTogglePrint }: { recipe: Recipe; isOpen: boolean; onSelect: (recipe: Recipe | null) => void; isPicked?: boolean; onTogglePrint?: (id: string) => void }) {
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
      {onTogglePrint && <div className="recipe-print-action"><button type="button" aria-pressed={isPicked} onClick={() => onTogglePrint(recipe.id)}>{isPicked ? "✓ added to print · remove" : "+ add this recipe to print"}</button>{isPicked && <a href="#print-selection">view print selection ↓</a>}</div>}
    </article>}
  </div>;
}

export default function DrinksPage({ initialTheme }: { initialTheme: ThemeName }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [filter, setFilter] = useState<"All" | "Tea" | "Coffee">("All");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"about" | "drinks" | "toppings" | "card">("about");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const visibleDrinks = drinks.filter((drink) => filter === "All" || drink.kind === filter);

  function togglePrintRecipe(id: string) {
    setSelectedCardIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  }

  useEffect(() => {
    const updateSection = () => {
      const readingLine = Math.min(window.innerHeight * 0.35, 280);
      let visibleSection: (typeof sectionIds)[number] = "about";
      for (const id of sectionIds) {
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
  }, []);

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

  function chooseTheme(choice: ThemeName) {
    setTheme(choice);
    applyTheme(choice);
    saveThemeCookie(choice);
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
        <div className="identity"><div className="dog-kaomoji" aria-hidden="true"><span>U・ᴥ・U</span><small>~ woof ~</small></div><a href="#top" className="site-name">jelly coffee lab</a></div>
        <nav className="sidebar-nav" aria-label="Main navigation"><a href="#about" className={activeSection === "about" ? "current" : undefined} aria-current={activeSection === "about" ? "location" : undefined}>{activeSection === "about" ? "> " : ""}about</a><a href="#drinks" className={activeSection === "drinks" ? "current" : undefined} aria-current={activeSection === "drinks" ? "location" : undefined}>{activeSection === "drinks" ? "> " : ""}drinks</a><a href="#toppings" className={activeSection === "toppings" ? "current" : undefined} aria-current={activeSection === "toppings" ? "location" : undefined}>{activeSection === "toppings" ? "> " : ""}toppings</a><a href={selectedCardIds.length > 0 ? "#print-selection" : "#card"} className={activeSection === "card" ? "current" : undefined} aria-current={activeSection === "card" ? "location" : undefined}>{activeSection === "card" ? "> " : ""}card{selectedCardIds.length > 0 && <span className="nav-card-count"> ({selectedCardIds.length})</span>}</a></nav>
        <div className="theme-picker">
          <div className="sidebar-label">THEME / <span>{themes.find((option) => option.id === theme)?.label}</span></div>
          <div className="theme-options" role="group" aria-label="Color theme">{visibleThemes.map((option) => <button key={option.id} type="button" className={theme === option.id ? "theme-option active" : "theme-option"} onClick={() => chooseTheme(option.id)} aria-label={`${option.label} theme`} aria-pressed={theme === option.id} title={option.label}>
            <span className="theme-swatch" style={{ background: gradientThemes.has(option.id) ? `linear-gradient(90deg, ${option.colors[0]} 0%, ${option.colors[2]} 50%, ${option.colors[3]} 100%)` : option.colors[0], color: option.colors[1], borderColor: option.colors[1] }}><i style={{ background: option.colors[2] }} /><i style={{ background: option.colors[3] }} /></span><span className="theme-name">{option.label}</span>
          </button>)}</div>
        </div>
        <div className="sound-setting"><span className="sidebar-label">SOUND</span><button type="button" className="sound-toggle" aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"} aria-pressed={soundEnabled} title={soundEnabled ? "Mute sounds" : "Enable sounds"} onClick={toggleSound}><span aria-hidden="true">♪</span> {soundEnabled ? "on" : "off"}</button></div>
        <div className="visit-count" aria-live="polite"><span>VISITS</span><strong>{visitCount === null ? "------" : String(visitCount).padStart(6, "0")}</strong></div>
        <div className="sidebar-bottom">{drinks.length} drinks + {toppings.length} {toppings.length === 1 ? "topping" : "toppings"}<br />last note: don&apos;t overmix</div>
      </aside>

      <main className="main-content">
        <div className="path">~/jelly/index.txt</div>
        <section id="about" className="about about-first" aria-label="About this page"><div className="about-hero"><div className="about-copy"><span className="section-label">ABOUT.TXT</span><h1>recipe log<span className="cursor">_</span></h1><p>We kept forgetting the good ratios. This is our little place to keep them.</p><div className="about-ascii" aria-hidden="true">{`[ coffee ] + [ tea ] = ♡`}</div></div><HeroCup /></div></section>

        <section id="drinks" className="recipe-section drink-list" aria-labelledby="drinks-title">
          <div className="section-heading"><span className="section-label">DRINKS.TXT</span><h2 id="drinks-title">drinks</h2><p className="testing-line"><span tabIndex={0}>What we are testing.</span></p></div>
          <div className="list-header"><span>FILE NAME</span><div className="filters" role="group" aria-label="Filter drinks">{(["All", "Tea", "Coffee"] as const).map((item) => <button type="button" key={item} onClick={() => { setFilter(item); setSelected(null); }} aria-pressed={filter === item}>{item.toLowerCase()}</button>)}</div></div>
          {visibleDrinks.map((drink) => <RecipeEntry key={drink.id} recipe={drink} isOpen={selected?.id === drink.id} onSelect={setSelected} isPicked={selectedCardIds.includes(drink.id)} onTogglePrint={togglePrintRecipe} />)}
          <p className="list-note">* recipes change when we make something better</p>
        </section>

        <section id="toppings" className="recipe-section topping-list" aria-labelledby="toppings-title">
          <div className="section-heading"><span className="section-label">TOPPINGS.TXT</span><h2 id="toppings-title">toppings</h2><p>The bits we put on top.</p></div>
          <div className="list-header"><span>FILE NAME</span><span>{toppings.length} {toppings.length === 1 ? "FILE" : "FILES"}</span></div>
          {toppings.map((topping) => <RecipeEntry key={topping.id} recipe={topping} isOpen={selected?.id === topping.id} onSelect={setSelected} isPicked={selectedCardIds.includes(topping.id)} onTogglePrint={togglePrintRecipe} />)}
        </section>
        <section id="card" className="recipe-section home-card" aria-labelledby="card-title">
          <div className="section-heading"><span className="section-label">CARD.TXT</span><h2 id="card-title">the little card</h2><p>Print it, punch it, save for later.</p></div>
          <Card3D theme={theme} />
          <div className="home-card-print">
            <h3>print the card</h3>
            <CardSheetDownload theme={theme} selectedIds={selectedCardIds} onToggle={togglePrintRecipe} onClear={() => setSelectedCardIds([])} />
            <div className="card-print-settings">
              <h4>print settings / PDF</h4>
              <ul>
                <li><strong>Paper:</strong> US Letter (8.5 × 11 in), color, one PDF page per sheet</li>
                <li><strong>Size:</strong> Actual Size / 100% — not Fit or Shrink</li>
                <li><strong>Sides:</strong> Double-sided, flip on long edge</li>
                <li><strong>Paper type:</strong> Cardstock, heavyweight, or matte, if your printer offers it</li>
              </ul>
            </div>
            <p className="home-card-print-note">Individual 5 × 3 in artwork · 1500 × 900 px PNG · {themes.find((option) => option.id === theme)?.label} colors · ⅛ in punch guide</p>
            <div className="flat-grid">
              <figure><Image src={cardDataUrl(theme, featuredCard, "front")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt={`Printable 5 by 3 inch recipe front for ${featuredCard.title} with a small dog logo`} /><figcaption><span>FRONT / RECIPE {featuredCard.number}</span><CardPngDownload theme={theme} side="front" /></figcaption></figure>
              <figure><Image src={cardDataUrl(theme, featuredCard, "back")} width={CARD_SIZE.width} height={CARD_SIZE.height} unoptimized alt="Printable 5 by 3 inch back with the Jelly Coffee Lab dog logo and shop name" /><figcaption><span>BACK / ORIGINAL MARK</span><CardPngDownload theme={theme} side="back" /></figcaption></figure>
            </div>
            <p className="home-card-print-tip">Test one sheet before cutting along the trim marks. The punch guide on the back is mirrored to line up with the front.</p>
          </div>
        </section>
        <footer><span>© jelly coffee lab</span><a href="#top">back to top ↑</a></footer>
      </main>
    </div>

  </>;
}
