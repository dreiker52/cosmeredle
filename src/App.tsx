import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useI18n, type MessageKey } from "./i18n/I18nProvider";

const COLUMNS: MessageKey[] = [
  "columns.name",
  "columns.homeworld",
  "columns.firstAppearance",
  "columns.species",
  "columns.investiture",
];

export default function App() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-storm-950 font-sans text-mist-100">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <p className="mb-6 text-center text-mist-300">{t("game.comingSoon")}</p>
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold uppercase text-mist-500">
          {COLUMNS.map((key) => (
            <div key={key} className="border-b border-mist-700 pb-2">
              {t(key)}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
