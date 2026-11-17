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
            "px-3 py-1 uppercase transition-colors " +
            (lang === l ? "bg-brass-500 text-storm-950" : "text-mist-300 hover:bg-storm-800")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
