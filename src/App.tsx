import { useCallback, useEffect, useState } from "react";
import { Header, type DialogName } from "./components/Header";
import { Footer } from "./components/Footer";
import { HelpDialog } from "./components/HelpDialog";
import { StatsDialog } from "./components/StatsDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { AboutDialog } from "./components/AboutDialog";
import { Game } from "./game/Game";
import { load, save } from "./lib/storage";
import { applyTheme, watchSystemTheme } from "./lib/theme";

const reapplyTheme = () => {
  const { theme, highContrast } = load().settings;
  applyTheme(theme, highContrast);
};

export default function App() {
  // En la primera visita se abre "Cómo jugar", que incluye el aviso de spoilers.
  const [dialog, setDialog] = useState<DialogName | null>(() => (load().settings.seenHelp ? null : "help"));

  useEffect(() => {
    reapplyTheme();
    return watchSystemTheme(reapplyTheme);
  }, []);

  const close = useCallback(() => {
    const data = load();
    if (!data.settings.seenHelp) save({ ...data, settings: { ...data.settings, seenHelp: true } });
    setDialog(null);
  }, []);

  // Con un diálogo abierto, el resto de la página queda inerte (ni foco ni lector de pantalla).
  const inert = dialog ? { inert: "" } : {};
  return (
    <>
      <div {...inert} className="flex min-h-screen flex-col bg-storm-950 font-sans text-mist-100">
        <Header onOpen={setDialog} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-2 py-6 min-[360px]:px-3 sm:px-4">
          <Game />
        </main>
        <Footer onAbout={() => setDialog("about")} />
      </div>
      {dialog === "help" && <HelpDialog onClose={close} />}
      {dialog === "stats" && <StatsDialog onClose={close} />}
      {dialog === "settings" && <SettingsDialog onClose={close} />}
      {dialog === "about" && <AboutDialog onClose={close} />}
    </>
  );
}
