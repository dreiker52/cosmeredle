import { useState } from "react";
import { bookById, displayAliases, displayName, investitureLabelsWithSystem, label, speciesLabel } from "../data/index";
import type { Character } from "../data/schema";
import { useI18n } from "../i18n/I18nProvider";
import { Countdown } from "../components/Countdown";

interface Props {
  target: Character;
  guessCount: number;
  streak: number;
  yesterday: Character | undefined;
}

export function VictoryCard({ target, guessCount, streak, yesterday }: Props) {
  const { t, lang } = useI18n();
  const [showDetails, setShowDetails] = useState(false);
  const aliases = displayAliases(target, lang);
  const book = bookById.get(target.firstAppearance)!;

  return (
    <section aria-live="polite" className="rounded-xl border border-brass-700 bg-storm-900 p-5 text-center shadow-lg">
      <h2 className="font-display text-2xl font-bold text-brass-300">{t("victory.title")}</h2>
      <p className="mt-2 text-mist-300">{t("victory.answer")}</p>
      <p className="font-display text-3xl font-bold text-mist-100">{displayName(target, lang)}</p>
      <p className="mt-1 text-sm text-mist-300">
        {guessCount === 1 ? t("victory.inOneGuess") : t("victory.inGuesses", { n: guessCount })} ·{" "}
        {t("victory.streak", { n: streak })}
      </p>

      <button
        type="button"
        onClick={() => setShowDetails((s) => !s)}
        aria-expanded={showDetails}
        className="mt-4 text-sm text-storm-400 underline hover:text-storm-50"
      >
        {showDetails ? t("victory.hideDetails") : t("victory.showDetails")}
      </button>
      {showDetails && (
        <dl className="mx-auto mt-3 grid max-w-sm grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-sm">
          {aliases.length > 0 && (
            <>
              <dt className="text-mist-500">{t("cell.aliases")}</dt>
              <dd>{aliases.join(", ")}</dd>
            </>
          )}
          <dt className="text-mist-500">{t("columns.homeworld")}</dt>
          <dd>{label("worlds", target.homeworld, lang)}</dd>
          <dt className="text-mist-500">{t("columns.firstAppearance")}</dt>
          <dd>
            {book.title[lang]} ({book.year})
          </dd>
          <dt className="text-mist-500">{t("columns.species")}</dt>
          <dd>{target.species.map((s) => speciesLabel(s, lang)).join(", ")}</dd>
          <dt className="text-mist-500">{t("columns.investiture")}</dt>
          <dd>
            {investitureLabelsWithSystem(target, lang).map((p) => (
              <span key={p} className="block">
                {p}
              </span>
            ))}
          </dd>
          <dd className="col-span-2 mt-2 text-center">
            <a href={target.coppermindUrl} target="_blank" rel="noreferrer" className="text-storm-400 underline hover:text-storm-50">
              {t("victory.coppermind")}
            </a>
          </dd>
        </dl>
      )}

      <div className="mt-5 border-t border-mist-700 pt-4">
        <p className="text-sm text-mist-500">{t("game.nextIn")}</p>
        <Countdown />
      </div>
      {yesterday && (
        <p className="mt-3 text-sm text-mist-500">
          {t("victory.yesterday")} <span className="font-semibold text-mist-300">{displayName(yesterday, lang)}</span>
        </p>
      )}
    </section>
  );
}
