import { useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { SearchBox } from "./SearchBox";
import { GuessTable } from "./GuessTable";
import { VictoryCard } from "./VictoryCard";
import { targetForDay, useGame } from "./useGame";
import { COLUMNS } from "./GuessRow";
import { compareCharacters } from "./compare";
import { bookById, characterById, displayName, roots } from "../data/index";

export function Game() {
  const { t, lang } = useI18n();
  const game = useGame();
  const guessed = useMemo(() => new Set(game.guesses.map((g) => g.id)), [game.guesses]);

  // Resumen del último intento para lectores de pantalla (la tabla visual no se anuncia sola).
  const last = game.lastGuessId ? characterById.get(game.lastGuessId) : undefined;
  let announcement = "";
  if (last && game.target) {
    const name = displayName(last, lang);
    if (last.id === game.target.id) announcement = t("game.announceWin", { name });
    else {
      const r = compareCharacters(last, game.target, bookById, roots);
      const colors = [r.homeworld, r.book.color, r.species, r.investiture];
      const details = colors.map((c, i) => `${t(COLUMNS[i + 1])} ${t(`cell.${c}`)}`).join(", ");
      announcement = t("game.announce", { name, details });
    }
  }

  if (!game.target) {
    return <p className="text-center text-mist-300">{t("game.noTarget")}</p>;
  }

  return (
    <div className="space-y-5">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="flex items-baseline justify-between text-sm text-mist-500">
        <span className="font-display text-brass-300">#{game.day}</span>
        <span>{t("game.guessCount", { n: game.guesses.length })}</span>
      </div>
      {game.solved ? (
        <VictoryCard
          day={game.day}
          target={game.target}
          guesses={game.guesses}
          streak={game.stats.currentStreak}
          yesterday={game.day > 0 ? targetForDay(game.day - 1) : undefined}
        />
      ) : (
        <>
          {game.guesses.length === 0 && <p className="text-center text-sm text-mist-300">{t("game.hint")}</p>}
          <SearchBox exclude={guessed} onSelect={game.guess} />
        </>
      )}
      <GuessTable guesses={game.guesses} target={game.target} lastGuessId={game.lastGuessId} />
    </div>
  );
}
