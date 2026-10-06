export const THEME_COOKIE = "jelly-theme";

export type ThemeName = "butter" | "blueberry" | "cherry" | "lilac" | "cloud" | "blush" | "spring" | "nightfall" | "peach" | "tidal" | "garden";

export function readTheme(value: string | undefined): ThemeName {
  if (value === "blush" || value === "spring") return value;
  return "blush";
}
