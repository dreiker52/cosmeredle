import { useI18n, type Lang } from "../i18n/I18nProvider";

const LANGS: Lang[] = ["es", "en"];

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.switchTo")}
      className="inline-flex overflow-hidden rounded-md border border-mist-700 text-sm font-semibold"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={
            "px-2 py-1 uppercase sm:px-3 transition-colors " +
            (lang === l ? "bg-brass-500 text-ink" : "text-mist-300 hover:bg-storm-800")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
