import { cookies } from "next/headers";
import DrinksPage from "./drinks-page";
import { readTheme, THEME_COOKIE } from "./theme";

export default async function Home() {
  const cookieStore = await cookies();
  const initialTheme = readTheme(cookieStore.get(THEME_COOKIE)?.value);
  return <DrinksPage initialTheme={initialTheme} />;
}
