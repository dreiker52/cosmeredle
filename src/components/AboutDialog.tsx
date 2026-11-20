import { useI18n } from "../i18n/I18nProvider";
import { Modal } from "./Modal";

export const REPO_URL = "https://github.com/dreiker52/cosmeredle";

const LINK = "text-storm-400 underline hover:text-storm-50";

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal title={t("about.title")} onClose={onClose}>
      <p>{t("about.intro")}</p>
      <p>{t("footer.disclaimer")}</p>
      <p>
        {t("about.data")}{" "}
        <a className={LINK} href="https://coppermind.net" target="_blank" rel="noreferrer">
          Coppermind
        </a>{" "}
        (
        <a className={LINK} href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" rel="noreferrer">
          CC BY-NC-ND 4.0
        </a>
        ).
      </p>
      <p>{t("about.privacy")}</p>
      <p>
        <a className={LINK} href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
          {t("about.report")}
        </a>
        {" · "}
        <a className={LINK} href={REPO_URL} target="_blank" rel="noreferrer">
          {t("about.source")}
        </a>
      </p>
    </Modal>
  );
}
