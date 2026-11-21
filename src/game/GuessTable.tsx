import type { Character } from "../data/schema";
import { useI18n } from "../i18n/I18nProvider";
import { COLUMNS, GuessRow } from "./GuessRow";

interface Props {
  guesses: Character[];
  target: Character;
  lastGuessId: string | null;
}

/** Tabla de intentos, el más reciente arriba. */
export function GuessTable({ guesses, target, lastGuessId }: Props) {
  const { t } = useI18n();
  if (!guesses.length) return null;
  return (
    <div role="table" aria-label={t("game.guessCount", { n: guesses.length })} className="space-y-1.5">
      <div role="row" className="grid grid-cols-5 gap-1 text-center text-[9px] font-semibold uppercase text-mist-500 min-[360px]:gap-1.5 min-[360px]:text-[10px] sm:text-xs">
        {COLUMNS.map((key) => (
          <div role="columnheader" key={key} className="hyphens-auto break-words border-b border-mist-700 pb-1">
            {t(key)}
          </div>
        ))}
      </div>
      {[...guesses].reverse().map((g) => (
        <GuessRow key={g.id} guess={g} target={target} animate={g.id === lastGuessId} />
      ))}
    </div>
  );
}
