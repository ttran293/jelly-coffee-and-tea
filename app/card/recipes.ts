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
  {
    id: "brown-sugar-hojicha",
    number: "04",
    title: "Iced brown sugar hojicha",
    meta: "5 MIN · 1 GLASS",
    ingredients: ["1 tsp hojicha powder", "60 ml warm water", "180 ml chilled oat milk", "10–15 ml brown sugar syrup", "Ice"],
    steps: [
      ["Whisk hojicha with a little", "water, then add the rest."],
      ["Syrup + ice in a glass;", "pour in the oat milk."],
      ["Pour hojicha over milk;", "stir before drinking."],
    ],
    note: "WHISK WITH A LITTLE WATER FIRST.",
  },
  {
    id: "orange-espresso-tonic",
    number: "05",
    title: "Orange espresso tonic",
    meta: "5 MIN · 1 GLASS",
    ingredients: ["1 espresso shot (~40 ml)", "120 ml chilled tonic", "15 ml fresh orange juice", "A strip of orange peel", "Ice"],
    steps: [
      ["Fill a glass with ice;", "add tonic + orange juice."],
      ["Slowly pour espresso", "over the ice."],
      ["Twist orange peel over", "the glass; stir to sip."],
    ],
    note: "KEEP THE TONIC COLD.",
  },
  {
    id: "salted-cheese-foam",
    number: "06",
    title: "Salted cheese foam",
    meta: "15 MIN · 3 SERVINGS",
    ingredients: ["2 oz cream cheese", "2/3 cup heavy cream", "2 tbsp cream (for cheese)", "3 tbsp sugar, divided", "1 tsp salt + 1/2 tsp vanilla", "About 1/4 cup milk"],
    steps: [
      ["Whisk cheese, 2 tbsp", "cream + 1 tbsp sugar."],
      ["Whip remaining cream", "with sugar, salt + vanilla."],
      ["Fold mixtures together;", "thin with milk to pour."],
    ],
    note: "STOP AT SOFT PEAKS.",
  },
  {
    id: "brown-sugar-syrup",
    number: "07",
    title: "Brown sugar syrup",
    meta: "10 MIN · 150 ML",
    ingredients: ["100 g dark brown sugar", "100 ml water", "Pinch of salt (optional)"],
    steps: [
      ["Warm sugar + water on", "medium-low; stir to melt."],
      ["Bubble gently for", "1–2 minutes; add salt."],
      ["Cool before adding", "10–15 ml to iced drinks."],
    ],
    note: "TRY IT WITH ICED HOJICHA.",
  },
  {
    id: "vanilla-cold-foam",
    number: "08",
    title: "Vanilla cold foam",
    meta: "5 MIN · 2 DRINKS",
    ingredients: ["60 ml cold heavy cream", "30 ml cold milk", "10 ml vanilla syrup", "A tiny pinch of salt"],
    steps: [
      ["Combine everything", "in a tall cup."],
      ["Froth for 15–25 sec", "until still pourable."],
      ["Pour over two iced", "drinks right away."],
    ],
    note: "DON'T WHIP IT STIFF.",
  },
];

export const FEATURED_CARD_INDEX = 2;
