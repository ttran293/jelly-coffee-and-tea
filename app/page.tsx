import { cookies } from "next/headers";
import DrinksPage from "./drinks-page";
import { readCollectionTheme, THEME_COOKIE } from "./theme";

export default async function Home() {
  const cookieStore = await cookies();
  const initialTheme = readCollectionTheme(cookieStore.get(THEME_COOKIE)?.value);
  return <DrinksPage initialTheme={initialTheme} />;
}
