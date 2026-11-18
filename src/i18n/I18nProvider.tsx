import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import es from "./es.json";
import en from "./en.json";
import { load, save } from "../lib/storage";

export type Lang = "es" | "en";
export type MessageKey = keyof typeof es;

const dictionaries: Record<Lang, Record<MessageKey, string>> = { es, en };

/** Idioma inicial: el guardado por el usuario o, si no hay, el del navegador. */
export function detectLang(saved: Lang | undefined, navigatorLang: string | undefined): Lang {
  if (saved === "es" || saved === "en") return saved;
  return navigatorLang?.toLowerCase().startsWith("es") ? "es" : "en";
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Traduce una clave; `{n}` y similares se sustituyen con `vars`. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    detectLang(load().settings.lang, typeof navigator !== "undefined" ? navigator.language : undefined),
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    const data = load();
    save({ ...data, settings: { ...data.settings, lang: l } });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) =>
        (dictionaries[lang][key] ?? key).replace(/\{(\w+)\}/g, (m, k: string) => (vars && k in vars ? String(vars[k]) : m)),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return ctx;
}
