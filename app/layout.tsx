import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jelly Coffee Lab | Open coffee & tea recipes",
  description: "Coffee and tea recipes we're working on.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try { var jellyTheme = localStorage.getItem("jelly-theme"); if (["butter", "blueberry", "cherry", "lilac"].includes(jellyTheme)) document.documentElement.dataset.theme = jellyTheme; } catch {}` }} /></head><body>{children}</body></html>;
}
