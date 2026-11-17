import { useI18n } from "../i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mx-auto max-w-3xl space-y-1 px-4 py-6 text-center text-xs text-mist-500">
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
