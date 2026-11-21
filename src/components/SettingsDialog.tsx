import { useState } from "react";
import { useI18n, type MessageKey } from "../i18n/I18nProvider";
import { load, save, type SaveData, type Theme } from "../lib/storage";
import { applyTheme } from "../lib/theme";
import { Modal } from "./Modal";

const THEMES: { value: Theme; label: MessageKey }[] = [
  { value: "system", label: "settings.themeSystem" },
  { value: "light", label: "settings.themeLight" },
  { value: "dark", label: "settings.themeDark" },
];

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [settings, setSettings] = useState(() => load().settings);

  const update = (patch: Partial<SaveData["settings"]>) => {
    const data = load();
    const next = { ...data.settings, ...patch };
    save({ ...data, settings: next });
    setSettings(next);
    applyTheme(next.theme, next.highContrast);
  };

  const theme = settings.theme ?? "system";
  return (
    <Modal title={t("settings.title")} onClose={onClose}>
      <fieldset>
        <legend className="mb-2 font-semibold text-mist-100">{t("settings.theme")}</legend>
        <div className="inline-flex overflow-hidden rounded-md border border-mist-700">
          {THEMES.map((o) => (
            <label
              key={o.value}
              className={
                "cursor-pointer px-3 py-1.5 font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass-500 " +
                (theme === o.value ? "bg-brass-500 text-ink" : "text-mist-300 hover:bg-storm-800")
              }
            >
              <input
                type="radio"
                name="theme"
                value={o.value}
                checked={theme === o.value}
                onChange={() => update({ theme: o.value })}
                className="sr-only"
              />
              {t(o.label)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 pt-2">
        <input
          type="checkbox"
          checked={!!settings.highContrast}
          onChange={(e) => update({ highContrast: e.target.checked })}
          className="mt-1 h-4 w-4 accent-brass-500"
        />
        <span>
          <span className="block font-semibold text-mist-100">{t("settings.highContrast")}</span>
          <span className="block text-xs text-mist-500">{t("settings.highContrastHint")}</span>
        </span>
      </label>
      <div className="flex gap-1.5 pt-1" aria-hidden>
        <span className="h-6 w-6 rounded border-2 border-hit bg-hit" />
        <span className="h-6 w-6 rounded border-2 border-partial bg-partial" />
        <span className="h-6 w-6 rounded border-2 border-miss bg-miss" />
      </div>
    </Modal>
  );
}
