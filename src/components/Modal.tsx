import { useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "../i18n/I18nProvider";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Diálogo modal: se cierra con Esc, con el botón ✕ o pulsando fuera; mantiene el foco dentro. */
export function Modal({ title, onClose, children }: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative my-8 w-full max-w-lg rounded-xl border border-storm-800 bg-storm-900 p-5 text-left shadow-2xl outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-brass-300">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modal.close")}
            className="-mr-1 -mt-1 rounded px-2 text-xl leading-none text-mist-300 hover:bg-storm-800 hover:text-mist-100"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-mist-300">{children}</div>
      </div>
    </div>
  );
}
