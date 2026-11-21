import type { Theme } from "./storage";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Tema efectivo: "system" se resuelve con la preferencia del sistema operativo. */
export function resolveTheme(theme: Theme | undefined, systemDark: boolean): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  return systemDark ? "dark" : "light";
}

const systemDark = () => typeof matchMedia === "function" && matchMedia(DARK_QUERY).matches;

/** Aplica tema y contraste como atributos de <html> (los lee src/index.css). */
export function applyTheme(theme: Theme | undefined, highContrast: boolean | undefined): void {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(theme, systemDark());
  if (highContrast) root.dataset.contrast = "high";
  else delete root.dataset.contrast;
}

/** Vuelve a aplicar el tema cuando cambia la preferencia del sistema. Devuelve la función para dejar de escuchar. */
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof matchMedia !== "function") return () => {};
  const mq = matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
