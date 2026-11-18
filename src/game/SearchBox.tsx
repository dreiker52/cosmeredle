import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { characters, displayName, label } from "../data/index";
import { useI18n } from "../i18n/I18nProvider";
import { createSearcher, MIN_QUERY } from "./search";

interface Props {
  exclude: ReadonlySet<string>;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/** Buscador con autocompletado (patrón combobox de WAI-ARIA). */
export function SearchBox({ exclude, onSelect, disabled }: Props) {
  const { t, lang } = useI18n();
  const searcher = useMemo(() => createSearcher(characters), []);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => searcher.search(query, exclude), [searcher, query, exclude]);
  const showList = open && query.trim().length >= MIN_QUERY;

  function choose(id: string) {
    onSelect(id);
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active] ?? results[0];
      if (pick) choose(pick.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={t("search.label")}
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        placeholder={t("search.placeholder")}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-mist-700 bg-storm-900 px-4 py-3 text-base text-mist-100 placeholder:text-mist-500 focus:border-brass-500 focus:outline-none focus:ring-2 focus:ring-brass-500/40 disabled:opacity-50"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-mist-700 bg-storm-900 py-1 shadow-xl"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2 text-sm text-mist-500">{t("search.noResults")}</li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${c.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()} // no perder el foco del input
                onClick={() => choose(c.id)}
                onMouseEnter={() => setActive(i)}
                className={
                  "flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2 " +
                  (i === active ? "bg-storm-800 text-brass-300" : "text-mist-100")
                }
              >
                <span className="font-medium">{displayName(c, lang)}</span>
                <span className="text-xs text-mist-500">{label("worlds", c.homeworld, lang)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
