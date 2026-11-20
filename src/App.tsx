import { useCallback, useState } from "react";
import { Header, type DialogName } from "./components/Header";
import { Footer } from "./components/Footer";
import { HelpDialog } from "./components/HelpDialog";
import { StatsDialog } from "./components/StatsDialog";
import { AboutDialog } from "./components/AboutDialog";
import { Game } from "./game/Game";
import { load, save } from "./lib/storage";

export default function App() {
  // En la primera visita se abre "Cómo jugar", que incluye el aviso de spoilers.
  const [dialog, setDialog] = useState<DialogName | null>(() => (load().settings.seenHelp ? null : "help"));

  const close = useCallback(() => {
    const data = load();
    if (!data.settings.seenHelp) save({ ...data, settings: { ...data.settings, seenHelp: true } });
    setDialog(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-storm-950 font-sans text-mist-100">
      <Header onOpen={setDialog} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Game />
      </main>
      <Footer />
      {dialog === "help" && <HelpDialog onClose={close} />}
      {dialog === "stats" && <StatsDialog onClose={close} />}
      {dialog === "about" && <AboutDialog onClose={close} />}
    </div>
  );
}
