import { useI18n, type MessageKey } from "../i18n/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

export type DialogName = "help" | "stats" | "settings" | "about";
type HeaderDialog = Exclude<DialogName, "about">;

/** Iconos SVG propios (trazos simples), para no depender de cómo pinte cada fuente los símbolos. */
const ICONS: Record<HeaderDialog, JSX.Element> = {
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" />
    </>
  ),
  stats: <path d="M5 20V11M12 20V5M19 20v-7" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
};

const BUTTONS: { name: HeaderDialog; label: MessageKey }[] = [
  { name: "help", label: "header.help" },
  { name: "stats", label: "header.stats" },
  { name: "settings", label: "header.settings" },
];

export function Header({ onOpen }: { onOpen: (d: DialogName) => void }) {
  const { t } = useI18n();
  return (
    <header className="border-b border-storm-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 min-[360px]:px-4">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold tracking-wide min-[360px]:text-xl sm:text-2xl text-brass-300">Cosmeredle</h1>
          <p className="truncate text-xs text-mist-500">{t("app.tagline")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 min-[360px]:gap-1 sm:gap-1.5">
          {BUTTONS.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => onOpen(b.name)}
              aria-label={t(b.label)}
              title={t(b.label)}
              className="flex h-7 w-7 items-center min-[360px]:h-8 min-[360px]:w-8 justify-center rounded-full text-mist-300 hover:bg-storm-800 hover:text-mist-100"
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
