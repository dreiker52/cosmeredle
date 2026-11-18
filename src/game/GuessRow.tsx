import type { ReactNode } from "react";
import { bookById, displayAliases, displayName, investitureLabels, investitureLabelsWithSystem, label, roots, speciesLabel } from "../data/index";
import type { Character } from "../data/schema";
import { useI18n, type MessageKey } from "../i18n/I18nProvider";
import { compareCharacters, type Arrow, type Color } from "./compare";

export const COLUMNS: MessageKey[] = [
  "columns.name",
  "columns.homeworld",
  "columns.firstAppearance",
  "columns.species",
  "columns.investiture",
];

const COLOR_CLASS: Record<Color, string> = {
  correct: "bg-hit border-hit",
  partial: "bg-partial border-partial text-storm-950",
  wrong: "bg-miss border-miss",
};
const ICON: Record<Color, string> = { correct: "✓", partial: "~", wrong: "✗" };

interface CellProps {
  color: Color;
  column: MessageKey;
  index: number;
  animate: boolean;
  tooltip?: string;
  arrow?: Arrow;
  /** Letra algo más pequeña para celdas con mucho texto (varios poderes). */
  dense?: boolean;
  children: ReactNode;
}

/** Valores de una celda multivalor, uno por línea. */
function Lines({ values }: { values: string[] }) {
  return (
    <>
      {values.map((v) => (
        <span key={v} className="block">
          {v}
        </span>
      ))}
    </>
  );
}

function Cell({ color, column, index, animate, tooltip, arrow, dense, children }: CellProps) {
  const { t } = useI18n();
  const arrowText = arrow === "up" ? t("cell.later") : arrow === "down" ? t("cell.earlier") : "";
  const status = t(`cell.${color}`);
  return (
    <div
      role="cell"
      title={[tooltip, arrowText].filter(Boolean).join("\n") || undefined}
      aria-label={`${t(column)}: ${tooltip ?? ""} (${status})${arrowText ? `. ${arrowText}` : ""}`}
      style={animate ? { animationDelay: `${index * 250}ms` } : undefined}
      className={
        "relative flex min-h-16 flex-col items-center justify-center rounded-md border-2 px-1 py-1.5 text-center font-medium leading-tight " +
        (dense ? "text-[10px] sm:text-xs " : "text-[11px] sm:text-sm ") +
        COLOR_CLASS[color] +
        (animate ? " animate-flip" : "")
      }
    >
      <span aria-hidden className="absolute right-1 top-0.5 text-[10px] opacity-80">
        {ICON[color]}
      </span>
      <span aria-hidden className="w-full hyphens-auto break-words [overflow-wrap:anywhere]">
        {children}
      </span>
      {arrow && (
        <span aria-hidden className="text-lg leading-none">
          {arrow === "up" ? "⬆" : "⬇"}
        </span>
      )}
    </div>
  );
}

interface Props {
  guess: Character;
  target: Character;
  animate: boolean;
}

export function GuessRow({ guess, target, animate }: Props) {
  const { lang, t } = useI18n();
  const r = compareCharacters(guess, target, bookById, roots);
  const book = bookById.get(guess.firstAppearance)!;
  const name = displayName(guess, lang);
  const aliases = displayAliases(guess, lang);
  const species = guess.species.map((id) => speciesLabel(id, lang));
  const powers = investitureLabels(guess, lang);
  const bookTitle = book.title[lang];

  return (
    <div role="row" className="grid grid-cols-5 gap-1.5">
      <Cell color={r.name} column={COLUMNS[0]} index={0} animate={animate} tooltip={aliases.length ? `${name}\n${t("cell.aliases")}: ${aliases.join(", ")}` : name}>
        {name}
      </Cell>
      <Cell color={r.homeworld} column={COLUMNS[1]} index={1} animate={animate} tooltip={label("worlds", guess.homeworld, lang)}>
        {label("worlds", guess.homeworld, lang)}
      </Cell>
      <Cell color={r.book.color} column={COLUMNS[2]} index={2} animate={animate} arrow={r.book.arrow} tooltip={`${bookTitle} (${book.year})`}>
        {bookTitle}
        <span className="block text-[10px] opacity-80">{book.year}</span>
      </Cell>
      <Cell color={r.species} column={COLUMNS[3]} index={3} animate={animate} tooltip={species.join(", ")} dense={species.length > 1}>
        <Lines values={species} />
      </Cell>
      <Cell
        color={r.investiture}
        column={COLUMNS[4]}
        index={4}
        animate={animate}
        tooltip={investitureLabelsWithSystem(guess, lang).join("\n")}
        dense={powers.length > 3}
      >
        <Lines values={powers} />
      </Cell>
    </div>
  );
}
