import { useI18n, type MessageKey } from "../i18n/I18nProvider";
import { averageGuesses, effectiveStreak, load } from "../lib/storage";
import { currentDay } from "../game/useGame";
import { Modal } from "./Modal";

export function StatsDialog({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const stats = load().stats;
  const avg = averageGuesses(stats);
  const items: [MessageKey, string][] = [
    ["stats.won", String(stats.won)],
    ["stats.currentStreak", String(effectiveStreak(stats, currentDay()))],
    ["stats.maxStreak", String(stats.maxStreak)],
    ["stats.average", avg ? avg.toLocaleString(lang, { maximumFractionDigits: 1 }) : "–"],
  ];
  return (
    <Modal title={t("stats.title")} onClose={onClose}>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(([key, value]) => (
          <div key={key} className="flex flex-col-reverse items-center rounded-lg bg-storm-950 p-3 text-center">
            <dt className="text-xs text-mist-500">{t(key)}</dt>
            <dd className="font-display text-3xl font-bold text-mist-100">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-mist-500">{t("stats.localOnly")}</p>
    </Modal>
  );
}
