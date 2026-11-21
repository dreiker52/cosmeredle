// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  localStorage.setItem("cosmeredle", JSON.stringify({ version: 1, settings: { lang: "es", seenHelp: true }, game: null, stats: {} }));
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

  it("comparte el resultado sin nombres copiándolo al portapapeles", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderApp();
    await guess(user, wrong.name);
    await guess(user, target.name);
    await user.click(screen.getByRole("button", { name: "Compartir resultado" }));

    const text = writeText.mock.calls[0][0] as string;
    const lines = text.split("\n");
    expect(lines[0]).toBe(`Cosmeredle #${currentDay()} — 2 intentos`);
    expect(lines[2]).toBe("🟩🟩🟩🟩🟩");
    expect(lines.at(-1)).toBe("https://dreiker52.github.io/cosmeredle/");
    expect(text).not.toContain(target.name);
    expect(await screen.findByText("¡Copiado al portapapeles!")).toBeTruthy();
  });
});

describe("diálogos", () => {
  it("abre 'Cómo jugar' con el aviso de spoilers solo en la primera visita", async () => {
    localStorage.setItem("cosmeredle", JSON.stringify({ version: 1, settings: { lang: "es" }, game: null, stats: {} }));
    const user = userEvent.setup();
    const { unmount } = renderApp();
    const dialog = screen.getByRole("dialog", { name: "Cómo jugar" });
    expect(within(dialog).getByText(/Aviso de spoilers/)).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    unmount();

    renderApp();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("muestra las estadísticas y 'Acerca de' desde la cabecera", async () => {
    const user = userEvent.setup();
    renderApp();
    await guess(user, target.name);
    await user.click(screen.getByRole("button", { name: "Estadísticas" }));
    const stats = screen.getByRole("dialog", { name: "Estadísticas" });
    expect(within(stats).getByText("Racha actual").parentElement?.querySelector("dd")?.textContent).toBe("1");
    await user.click(within(stats).getByRole("button", { name: "Cerrar" }));

    await user.click(screen.getByRole("button", { name: "Acerca de" })); // enlace del pie
    const about = screen.getByRole("dialog", { name: "Acerca de" });
    expect(within(about).getByRole("link", { name: "Informar de un error" }).getAttribute("href")).toContain("/issues");
  });

  it("los ajustes cambian el tema y el alto contraste y se recuerdan", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Ajustes" }));
    const dialog = screen.getByRole("dialog", { name: "Ajustes" });
    await user.click(within(dialog).getByRole("radio", { name: "Claro" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    await user.click(within(dialog).getByRole("checkbox", { name: /Alto contraste/ }));
    expect(document.documentElement.dataset.contrast).toBe("high");
    expect(load().settings).toMatchObject({ theme: "light", highContrast: true });
  });

  it("con un diálogo abierto el resto de la página queda inerte", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Estadísticas" }));
    expect(screen.getByRole("banner").closest("[inert]")).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("banner").closest("[inert]")).toBeNull();
  });
});
