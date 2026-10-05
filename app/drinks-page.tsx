"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_COOKIE, type ThemeName } from "./theme";

type Drink = {
  id: string; number: string; name: string; kind: "Tea" | "Coffee";
  description: string; image: string; time: string; yield: string;
  ingredients: string[]; method: string[]; note: string;
};

const themes: { id: ThemeName; label: string; colors: string[] }[] = [
  { id: "butter", label: "Butter Paper", colors: ["#f4ebcf", "#292c3e", "#ae3854", "#2c7091"] },
  { id: "blueberry", label: "Blueberry", colors: ["#232841", "#fbf3e5", "#a8d9f0", "#f3ae91"] },
  { id: "cherry", label: "Cherry Cola", colors: ["#40252e", "#fff1df", "#ffb49d", "#f2d17c"] },
  { id: "lilac", label: "Lilac Screen", colors: ["#dedaf0", "#302d4a", "#6852af", "#b65475"] },
];

function applyTheme(choice: ThemeName) {
  document.documentElement.dataset.theme = choice;
}

function saveThemeCookie(choice: ThemeName) {
  document.cookie = `${THEME_COOKIE}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

const drinks: Drink[] = [
  {
    id: "strawberry-matcha", number: "01", name: "Strawberry cloud matcha", kind: "Tea",
    description: "Strawberries, jam, matcha, milk.", image: "/strawberry-matcha-latte.png",
    time: "8 min", yield: "1 glass",
    ingredients: ["3 fresh strawberries (about 45 g)", "12 g strawberry jam", "2 g matcha powder", "30 ml warm water (about 80°C / 176°F)", "150 ml cold milk of choice", "40 ml cold vanilla cream or sweet foam", "Ice"],
    method: ["Mash the strawberries with the jam in the bottom of a tall glass.", "Whisk matcha with warm water until smooth and lightly foamy.", "Fill the glass with ice, then pour in the milk.", "Slowly add the matcha. Spoon the vanilla cream on top and serve right away."],
    note: "12 g jam worked. Next time: try 6 g and see if the layers still hold.",
  },
  {
    id: "honey-oat-espresso", number: "02", name: "Honey oat espresso", kind: "Coffee",
    description: "Espresso, honey, oat milk, a pinch of salt.", image: "/honey-oat-espresso.png",
    time: "5 min", yield: "1 glass",
    ingredients: ["1 double espresso (about 36 g)", "12 g honey", "150 ml chilled oat milk", "A tiny pinch of flaky salt", "Ice"],
    method: ["Stir the honey and salt into the hot espresso until dissolved.", "Fill a short glass with ice and add the oat milk.", "Pour the espresso over the milk. Give it one gentle stir before sipping."],
    note: "We keep forgetting the salt. It makes a difference. Darker espresso next time?",
  },
];

let visitRequest: Promise<number | null> | null = null;

export default function DrinksPage({ initialTheme }: { initialTheme: ThemeName }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [filter, setFilter] = useState<"All" | "Tea" | "Coffee">("All");
  const [selected, setSelected] = useState<Drink | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const visibleDrinks = drinks.filter((drink) => filter === "All" || drink.kind === filter);

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

  return <>
    <div className="site-shell" id="top">
      <aside className="sidebar">
        <div className="identity"><div className="dog-kaomoji" aria-hidden="true"><span>U・ᴥ・U</span><small>~ woof ~</small></div><a href="#top" className="site-name">jelly coffee lab</a></div>
        <nav className="sidebar-nav" aria-label="Main navigation"><a href="#drinks" className="current">&gt; drinks</a><a href="#about">about</a></nav>
        <div className="theme-picker" role="group" aria-label="Color theme">
          <div className="sidebar-label">THEME / <span>{themes.find((option) => option.id === theme)?.label}</span></div>
          <div className="theme-options">{themes.map((option) => <button key={option.id} type="button" className={theme === option.id ? "theme-option active" : "theme-option"} onClick={() => chooseTheme(option.id)} aria-label={`${option.label} theme`} aria-pressed={theme === option.id} title={option.label}>
            <span className="theme-swatch" style={{ background: option.colors[0], color: option.colors[1], borderColor: option.colors[1] }}><i style={{ background: option.colors[2] }} /><i style={{ background: option.colors[3] }} /></span><span className="theme-name">{option.label}</span>
          </button>)}</div>
        </div>
        <div className="visit-count" aria-live="polite"><span>VISITS</span><strong>{visitCount === null ? "------" : String(visitCount).padStart(6, "0")}</strong></div>
        <div className="sidebar-bottom">2 recipes here so far<br />last note: keep the ice</div>
      </aside>

      <main className="main-content">
        <div className="path">~/jelly/drinks.txt</div>
        <h1>little drink log<span className="cursor">_</span></h1>
        <p className="intro">We keep changing these. Writing down the versions that worked.</p>

        <section id="drinks" className="drink-list" aria-label="Drink recipes">
          <div className="list-header"><span>FILE NAME</span><div className="filters" role="group" aria-label="Filter drinks">{(["All", "Tea", "Coffee"] as const).map((item) => <button type="button" key={item} onClick={() => { setFilter(item); setSelected(null); }} aria-pressed={filter === item}>{item.toLowerCase()}</button>)}</div></div>
          {visibleDrinks.map((drink) => {
            const isOpen = selected?.id === drink.id;
            return <div className="drink-entry" key={drink.id}>
              <button id={`drink-${drink.id}`} type="button" className="drink-row" onClick={() => setSelected(isOpen ? null : drink)} aria-expanded={isOpen} aria-controls={`recipe-${drink.id}`} aria-label={`${isOpen ? "Hide" : "Read"} ${drink.name} recipe`}>
                <span className="drink-number">{drink.number} /</span><span className="drink-info"><strong>{drink.name}</strong><small>{drink.description}</small></span><span className="drink-kind">{drink.kind.toUpperCase()}</span><span className="row-arrow" aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <article id={`recipe-${drink.id}`} className="recipe-sheet" role="region" aria-labelledby={`recipe-title-${drink.id}`}>
                <div className="recipe-sheet-head"><span className="recipe-overline">~/jelly/recipe-{drink.number}.txt <span>·</span> {drink.kind.toUpperCase()}</span><button type="button" className="recipe-close" onClick={() => { setSelected(null); document.getElementById(`drink-${drink.id}`)?.focus(); }}>close ×</button></div>
                <div className="recipe-lead"><div className="recipe-image"><Image src={drink.image} alt={`${drink.name} in a glass`} width={150} height={160} sizes="(max-width: 520px) 92px, 150px" /></div><div className="recipe-lead-copy"><h2 id={`recipe-title-${drink.id}`} className="recipe-title">{drink.name}</h2><p className="recipe-intro">{drink.description}</p><div className="recipe-facts"><span>TIME <strong>{drink.time}</strong></span><span>MAKES <strong>{drink.yield}</strong></span></div></div></div>
                <div className="recipe-columns"><section><h3>What you&apos;ll need</h3><ul>{drink.ingredients.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Make it</h3><ol>{drink.method.map((step) => <li key={step}>{step}</li>)}</ol></section></div>
                <p className="lab-note"><strong>Note:</strong> {drink.note}</p><p className="sample-label">[ sample recipe / version 01 ]</p>
              </article>}
            </div>;
          })}
          <p className="list-note">* recipes change when we make something better</p>
        </section>

        <section id="about" className="about"><span className="section-label">ABOUT.TXT</span><h2>why this page exists</h2><p>We kept forgetting the good ratios. This is our little place to keep them.</p><div className="about-ascii" aria-hidden="true">{`[ coffee ] + [ tea ] = ♡`}</div></section>
        <footer><span>© jelly coffee lab</span><a href="#top">back to top ↑</a></footer>
      </main>
    </div>

  </>;
}
