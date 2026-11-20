import { useI18n } from "../i18n/I18nProvider";
import { Modal } from "./Modal";

const SWATCH = "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 text-xs font-bold";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal title={t("help.title")} onClose={onClose}>
      <p>{t("help.intro")}</p>

      <h3 className="pt-1 font-semibold text-mist-100">{t("help.columnsTitle")}</h3>
      <ul className="list-disc space-y-1 pl-5">
        <li>{t("help.colName")}</li>
        <li>{t("help.colWorld")}</li>
        <li>{t("help.colBook")}</li>
        <li>{t("help.colSpecies")}</li>
        <li>{t("help.colPowers")}</li>
      </ul>

      <h3 className="pt-1 font-semibold text-mist-100">{t("help.colorsTitle")}</h3>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <span className={`${SWATCH} border-hit bg-hit`}>✓</span>
          {t("help.correct")}
        </li>
        <li className="flex items-center gap-2">
          <span className={`${SWATCH} border-partial bg-partial text-storm-950`}>~</span>
          {t("help.partial")}
        </li>
        <li className="flex items-center gap-2">
          <span className={`${SWATCH} border-miss bg-miss`}>✗</span>
          {t("help.wrong")}
        </li>
        <li className="flex items-center gap-2">
          <span className={`${SWATCH} border-mist-700`}>⬆</span>
          {t("help.arrows")}
        </li>
      </ul>

      <p>{t("help.daily")}</p>

      <div role="note" className="rounded-lg border border-brass-700 bg-storm-950 p-3">
        <p className="font-semibold text-brass-300">⚠ {t("spoilers.title")}</p>
        <p className="mt-1">{t("spoilers.body")}</p>
      </div>

      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-brass-500 px-5 py-2 font-semibold text-storm-950 hover:bg-brass-300"
        >
          {t("help.play")}
        </button>
      </div>
    </Modal>
  );
}
