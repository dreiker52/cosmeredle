import { useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { SearchBox } from "./SearchBox";
import { GuessTable } from "./GuessTable";
import { VictoryCard } from "./VictoryCard";
import { targetForDay, useGame } from "./useGame";

export function Game() {
  const { t } = useI18n();
  const game = useGame();
  const guessed = useMemo(() => new Set(game.guesses.map((g) => g.id)), [game.guesses]);

  if (!game.target) {
    return <p className="text-center text-mist-300">{t("game.noTarget")}</p>;
  }

  return (
    <div className="space-y-5">
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
