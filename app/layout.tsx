import type { Metadata } from "next";
import { cookies } from "next/headers";
import { readTheme, THEME_COOKIE } from "./theme";
import "./globals.css";
import "./card/card.css";

export const metadata: Metadata = {
  title: "Jelly Coffee Lab | Open coffee & tea recipes",
  description: "Coffee and tea recipes we're working on.",
  icons: { icon: "/favicon.svg?v=3", shortcut: "/favicon.svg?v=3" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = readTheme(cookieStore.get(THEME_COOKIE)?.value);
  return <html lang="en" data-theme={theme} suppressHydrationWarning><body>{children}</body></html>;
}
