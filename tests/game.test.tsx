// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { currentDay, targetForDay } from "../src/game/useGame";
import { characters, displayName } from "../src/data/index";
import { load } from "../src/lib/storage";

const target = targetForDay(currentDay())!;
const wrong = characters.find((c) => c.id !== target.id && c.homeworld !== target.homeworld)!;

function renderApp() {
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
}

async function guess(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = screen.getByRole("combobox");
  await user.clear(input);
  await user.type(input, name);
  await user.keyboard("{Enter}");
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("cosmeredle", JSON.stringify({ version: 1, settings: { lang: "es" }, game: null, stats: {} }));
});
afterEach(cleanup);

describe("partida", () => {
  it("un intento fallido añade una fila con colores y el acierto muestra la victoria", async () => {
    const user = userEvent.setup();
    renderApp();
    await guess(user, wrong.name);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // cabecera + 1 intento
    const cells = within(rows[1]).getAllByRole("cell");
    expect(cells).toHaveLength(5);
    expect(cells[0].getAttribute("aria-label")).toContain("no coincide");
    expect(cells[1].getAttribute("aria-label")).toContain("no coincide");
    expect(screen.getByText("Intentos: 1")).toBeTruthy();

    await guess(user, target.name);
    expect(screen.getByText("¡Lo has adivinado!")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(load().stats).toMatchObject({ won: 1, currentStreak: 1, totalGuesses: 2 });
  });

  it("navega el autocompletado con el teclado y no ofrece personajes ya intentados", async () => {
    const user = userEvent.setup();
    renderApp();
    await guess(user, wrong.name);
    await user.type(screen.getByRole("combobox"), wrong.name);
    const options = screen.queryAllByRole("option").map((o) => o.textContent);
    expect(options.some((o) => o?.startsWith(displayName(wrong, "es")))).toBe(false);
  });

  it("conserva la partida al recargar y la repinta al cambiar de idioma", async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();
    await guess(user, wrong.name);
    unmount();

    renderApp();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Intentos: 1")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "en" }));
    expect(screen.getByText("Guesses: 1")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(document.documentElement.lang).toBe("en");
  });
});
