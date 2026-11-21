import { useI18n } from "../i18n/I18nProvider";
import { REPO_URL } from "./AboutDialog";

export function Footer({ onAbout }: { onAbout: () => void }) {
  const { t } = useI18n();
  return (
    <footer className="mx-auto max-w-3xl space-y-2 px-4 py-6 text-center text-xs text-mist-500">
      <p className="space-x-3 text-sm">
        <button type="button" onClick={onAbout} className="underline hover:text-mist-300">
          {t("header.about")}
        </button>
        <a className="underline hover:text-mist-300" href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
          {t("about.report")}
        </a>
      </p>
      <p>{t("footer.disclaimer")}</p>
      <p>
        <a className="underline hover:text-mist-300" href="https://coppermind.net" target="_blank" rel="noreferrer">
          {t("footer.data")}
        </a>{" "}
        {t("footer.privacy")}
      </p>
    </footer>
  );
}
