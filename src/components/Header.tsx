import { useI18n } from "../i18n/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="border-b border-storm-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-brass-300">Cosmeredle</h1>
          <p className="text-xs text-mist-500">{t("app.tagline")}</p>
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
}
