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
    id: "basic-matcha-latte",
    number: "01",
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
    id: "lemon-tea-batch", number: "02", title: "Lemon tea (batch)", meta: "ABOUT 1 L",
    ingredients: ["850 g brewed tea", "270 g lemon syrup", "Ice"],
    steps: [["Brew tea or use", "Ito En bottled tea."], ["Mix in lemon syrup.", "Chill well."], ["Serve over ice;", "adjust syrup to taste."]],
    note: "BLACK TEA MAY NEED MORE SYRUP.",
  },
  {
    id: "lemon-matcha", number: "03", title: "Lemon matcha", meta: "1 GLASS",
    ingredients: ["35–40 g lemon syrup", "80 g water", "3 g matcha", "60 g warm water", "Ice"],
    steps: [["Whisk matcha with", "60 g warm water."], ["Mix lemon syrup +", "80 g water in glass."], ["Add ice; pour matcha", "over. Stir to drink."]],
    note: "USE THE LEMON SYRUP RECIPE.",
  },
  {
    id: "salted-maple-matcha-latte", number: "04", title: "Salted maple matcha", meta: "1 LATTE",
    ingredients: ["3 g matcha + 30 g water", "2–3 tsp maple syrup", "90–100 g milk + ice", "4 tbsp heavy cream", "3 tbsp milk + 2 tsp maple", "1/4 tsp sea salt"],
    steps: [["Froth cream, milk,", "maple + sea salt."], ["Whisk matcha with", "170°F water + maple."], ["Layer milk + matcha;", "top with 20–30 g cream."]],
    note: "FROTH TOPPING UNTIL CREAMY.",
  },
  {
    id: "salted-cheese-cocoa", number: "05", title: "Salted cheese cocoa", meta: "1 GLASS",
    ingredients: ["7 g cocoa powder", "50 ml hot water", "80 ml unsweetened milk", "20 ml condensed milk", "Salt to taste", "30 g cheese foam v1.0"],
    steps: [["Whisk cocoa with hot", "water until smooth."], ["Stir in both milks;", "add salt to taste."], ["Top with 30 g salted", "cheese foam v1.0."]],
    note: "USE CHEESE FOAM V1.0.",
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
    note: "ADD 10–15 ML TO AN ICED DRINK.",
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
    id: "lemon-syrup", number: "09", title: "Lemon syrup", meta: "~500 ML",
    ingredients: ["800 g lemons", "~192 g lemon peel", "400 g brown sugar", "Pinch of salt", "~200 ml lemon juice"],
    steps: [["Peel lemons; massage", "peel with sugar + salt."], ["Steep 3–4 hr; juice", "lemons and chill juice."], ["Simmer peels 10 min;", "remove, cool to 70–80°C."], ["Add juice; simmer", "10 min, skim + chill."]],
    note: "AVOID WHITE PITH; REFRIGERATE.",
  },
  {
    id: "salted-maple-cream-top", number: "10", title: "Salted maple cream", meta: "TOPPING",
    ingredients: ["4 tbsp heavy cream", "1/4 tsp sea salt", "3 tbsp milk", "2 tsp maple syrup"],
    steps: [["Combine cream, salt,", "milk + maple syrup."], ["Froth until cream-", "textured and pourable."], ["Top a maple matcha", "latte to taste."]],
    note: "USE 20–30 G ON A LATTE.",
  },
  {
    id: "salted-cheese-foam-v1", number: "11", title: "Cheese foam v1.0", meta: "15 MIN · 3 SERVINGS",
    ingredients: ["2 oz cream cheese", "1 Laughing Cow cheese", "2/3 cup heavy cream", "2 tbsp cream + 3 tbsp sugar", "1 tsp salt + 1/2 tsp vanilla", "~1/4 cup milk"],
    steps: [["Whisk cheeses, 2 tbsp", "cream + 1 tbsp sugar."], ["Whip remaining cream,", "sugar, salt + vanilla."], ["Fold together; thin", "with milk to pour."]],
    note: "STOP AT SOFT PEAKS.",
  },
  {
    id: "osmanthus-syrup", number: "12", title: "Osmanthus syrup", meta: "25–35 MIN + COOL",
    ingredients: ["7 g dried osmanthus", "200 ml water", "200 g rock sugar", "1/2 tangerine, juiced", "Tangerine peel strips"],
    steps: [["Rinse flowers; simmer", "in water 10–15 min."], ["Strain; reserve flowers.", "Swirl in rock sugar."], ["Add tangerine; simmer", "15–20 min, then cool."], ["Stir flowers back in;", "refrigerate in a jar."]],
    note: "SYRUP THICKENS AS IT COOLS.",
  },
  {
    id: "sesame-cucumber-bites",
    number: "13",
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
    number: "14",
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
    number: "15",
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
    number: "16",
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
    number: "17",
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

export const FEATURED_CARD_INDEX = 0;
export const MAX_PRINT_CARDS = 10;
