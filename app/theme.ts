export const THEME_COOKIE = "jelly-theme";

const themeNames = ["butter", "blueberry", "cherry", "lilac", "cloud", "blush", "spring", "nightfall", "peach", "tidal", "garden"] as const;

export type ThemeName = typeof themeNames[number];

export function readTheme(value: string | undefined): ThemeName {
  return themeNames.find((theme) => theme === value) ?? "spring";
}
