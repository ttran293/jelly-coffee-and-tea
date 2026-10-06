export type CardRecipe = {
  id: string;
  number: string;
  title: string;
  meta: string;
  ingredients: string[];
  steps: string[][];
  note: string;
};

// Short card-sized versions of the drink recipes shown in the notebook above.
export const CARD_RECIPES: CardRecipe[] = [
  {
    id: "strawberry-matcha",
    number: "01",
    title: "Strawberry cloud matcha",
    meta: "8 MIN · 1 GLASS",
    ingredients: ["3 strawberries (~45 g)", "12 g strawberry jam", "2 g matcha + 30 ml water", "150 ml cold milk", "40 ml vanilla cream", "Ice"],
    steps: [
      ["Mash berries + jam", "in a tall glass."],
      ["Whisk matcha with", "80°C warm water."],
      ["Add ice + milk, then", "pour in the matcha."],
      ["Top with vanilla", "cream and serve."],
    ],
    note: "NEXT TIME: TRY 6 G JAM.",
  },
  {
    id: "honey-oat-espresso",
    number: "02",
    title: "Honey oat espresso",
    meta: "5 MIN · 1 GLASS",
    ingredients: ["1 double espresso (~36 g)", "12 g honey", "150 ml chilled oat milk", "A tiny pinch of flaky salt", "Ice"],
    steps: [
      ["Stir honey + salt into", "hot espresso until dissolved."],
      ["Ice + oat milk in a", "short glass."],
      ["Pour espresso over milk;", "give one gentle stir."],
    ],
    note: "DON'T FORGET THE SALT.",
  },
  {
    id: "basic-matcha-latte",
    number: "03",
    title: "Go-to basic matcha latte",
    meta: "5–10 MIN · 1 GLASS",
    ingredients: ["3 g matcha", "30 g water at 175°F", "90–100 ml milk of choice", "1 tsp syrup (optional)", "Ice (optional)"],
    steps: [
      ["Sift matcha; whisk with", "hot water until frothy."],
      ["Add ice + syrup to", "a glass, then milk."],
      ["Pour matcha over milk;", "stir before drinking."],
    ],
    note: "MATCHA : WATER : MILK = 1 : 10 : 30.",
  },
];

export const FEATURED_CARD_INDEX = 2;
