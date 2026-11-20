import { useI18n, type MessageKey } from "../i18n/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

export type DialogName = "help" | "stats" | "about";

/** Iconos SVG propios (trazos simples), para no depender de cómo pinte cada fuente los símbolos. */
const ICONS: Record<DialogName, JSX.Element> = {
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" />
    </>
  ),
  stats: <path d="M5 20V11M12 20V5M19 20v-7" />,
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <circle cx="12" cy="7.5" r=".6" fill="currentColor" />
    </>
  ),
};

const BUTTONS: { name: DialogName; label: MessageKey }[] = [
  { name: "help", label: "header.help" },
  { name: "stats", label: "header.stats" },
  { name: "about", label: "header.about" },
];

export function Header({ onOpen }: { onOpen: (d: DialogName) => void }) {
  const { t } = useI18n();
  return (
    <header className="border-b border-storm-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold sm:text-2xl tracking-wide text-brass-300">Cosmeredle</h1>
          <p className="truncate text-xs text-mist-500">{t("app.tagline")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {BUTTONS.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => onOpen(b.name)}
              aria-label={t(b.label)}
              title={t(b.label)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-mist-300 hover:bg-storm-800 hover:text-mist-100"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[b.name]}
              </svg>
            </button>
          ))}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
