import type { ReactNode } from "react";
import { bookById, displayAliases, displayName, label } from "../data/index";
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
  children: ReactNode;
}

function Cell({ color, column, index, animate, tooltip, arrow, children }: CellProps) {
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
        "relative flex min-h-16 flex-col items-center justify-center rounded-md border-2 p-1 text-center text-[11px] font-medium leading-tight sm:text-sm " +
        COLOR_CLASS[color] +
        (animate ? " animate-flip" : "")
      }
    >
      <span aria-hidden className="absolute right-1 top-0.5 text-[10px] opacity-80">
        {ICON[color]}
      </span>
      <span aria-hidden className="line-clamp-3 break-words">
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
  const r = compareCharacters(guess, target, bookById);
  const book = bookById.get(guess.firstAppearance)!;
  const name = displayName(guess, lang);
  const aliases = displayAliases(guess, lang);
  const list = (cat: "species" | "investiture", ids: string[]) => ids.map((id) => label(cat, id, lang)).join(", ");
  const species = list("species", guess.species);
  const powers = list("investiture", guess.investiture);
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
      <Cell color={r.species} column={COLUMNS[3]} index={3} animate={animate} tooltip={species}>
        {species}
      </Cell>
      <Cell
        color={r.investiture}
        column={COLUMNS[4]}
        index={4}
        animate={animate}
        tooltip={guess.investitureDetail?.length ? `${powers}\n${guess.investitureDetail.join(", ")}` : powers}
      >
        {powers}
      </Cell>
    </div>
  );
}
