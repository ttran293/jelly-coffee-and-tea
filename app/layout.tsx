import type { Metadata } from "next";
import { cookies } from "next/headers";
import { readCollectionTheme, THEME_COOKIE } from "./theme";
import "./globals.css";
import "./card/card.css";

export const metadata: Metadata = {
  title: "Jelly's Lab | Coffee/Tea, Food & Drinks",
  description: "Recipes for coffee, tea, appetizers, sauces, food, cocktails, and mocktails.",
  icons: { icon: "/favicon.svg?v=3", shortcut: "/favicon.svg?v=3" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = readCollectionTheme(cookieStore.get(THEME_COOKIE)?.value);
  return <html lang="en" data-theme={theme} suppressHydrationWarning><body>{children}</body></html>;
}
