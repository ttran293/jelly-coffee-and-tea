export const THEME_COOKIE = "jelly-theme";

export type ThemeName = "butter" | "blueberry" | "cherry" | "lilac";

export function readTheme(value: string | undefined): ThemeName {
  if (value === "blueberry" || value === "cherry" || value === "lilac") return value;
  return "butter";
}
