import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Game } from "./game/Game";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-storm-950 font-sans text-mist-100">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Game />
      </main>
      <Footer />
    </div>
  );
}
