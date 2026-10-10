export type CardRecipe = {
  id: string;
  number: string;
  title: string;
  meta: string;
  ingredients: string[];
  steps: string[][];
  note: string;
};

// Short card-sized versions of the recipes shown in the notebook above.
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
  {
    id: "sesame-cucumber-bites",
    number: "09",
    title: "Sesame cucumber bites",
    meta: "15 MIN · 12 BITES",
    ingredients: ["1 large cucumber", "1/2 cup Greek yogurt", "1 tsp lemon juice", "1 tsp toasted sesame oil", "1 tsp sesame seeds", "Salt; chili + scallions optional"],
    steps: [
      ["Slice cucumber into", "12 thick rounds; pat dry."],
      ["Mix yogurt, lemon,", "sesame oil + salt."],
      ["Top cucumber with", "yogurt + sesame seeds."],
      ["Add chili or scallions;", "serve right away."],
    ],
    note: "SERVE WHILE THE CUCUMBER IS CRISP.",
  },
  {
    id: "lemon-herb-yogurt-sauce",
    number: "10",
    title: "Lemon herb yogurt sauce",
    meta: "10 MIN · 3/4 CUP",
    ingredients: ["3/4 cup Greek yogurt", "1 tbsp lemon juice", "1 tbsp dill or parsley", "1 small garlic clove", "1 tbsp water, plus more", "Salt + black pepper"],
    steps: [
      ["Mix yogurt, lemon,", "herbs + grated garlic."],
      ["Add water until the", "sauce pours as you like."],
      ["Season with salt +", "pepper; taste for lemon."],
    ],
    note: "GARLIC GETS STRONGER AS IT SITS.",
  },
  {
    id: "garlic-mushroom-toast",
    number: "11",
    title: "Garlic mushroom toast",
    meta: "20 MIN · 2 TOASTS",
    ingredients: ["2 thick slices of bread", "200 g sliced mushrooms", "1 tbsp olive oil", "1 garlic clove + 1 tsp butter", "1 tsp lemon juice", "Salt, pepper + parsley"],
    steps: [
      ["Toast the bread", "until golden."],
      ["Brown mushrooms in", "oil for 5–7 minutes."],
      ["Add garlic + butter;", "cook 1 minute. Season."],
      ["Add lemon; spoon onto", "toast with parsley."],
    ],
    note: "GIVE MUSHROOMS ROOM TO BROWN.",
  },
  {
    id: "blueberry-gin-fizz",
    number: "12",
    title: "Blueberry gin fizz",
    meta: "8 MIN · 1 GLASS",
    ingredients: ["8 fresh blueberries", "45 ml gin", "20 ml lemon juice", "15 ml simple syrup", "60 ml sparkling water", "Ice + lemon slice"],
    steps: [
      ["Muddle berries with", "lemon juice + syrup."],
      ["Shake with gin + ice;", "strain over fresh ice."],
      ["Top with sparkling", "water; garnish."],
    ],
    note: "USE LESS SYRUP FOR SWEET BERRIES.",
  },
  {
    id: "blueberry-lime-spritz",
    number: "13",
    title: "Blueberry lime spritz",
    meta: "7 MIN · 1 GLASS",
    ingredients: ["10 fresh blueberries", "20 ml lime juice", "15 ml simple syrup", "120 ml sparkling water", "Ice", "Mint sprig (optional)"],
    steps: [
      ["Muddle berries with", "lime juice + syrup."],
      ["Fill glass with ice;", "add sparkling water."],
      ["Stir gently and", "garnish with mint."],
    ],
    note: "ADD BUBBLES JUST BEFORE SERVING.",
  },
];

export const FEATURED_CARD_INDEX = 2;
export const MAX_PRINT_CARDS = 10;
