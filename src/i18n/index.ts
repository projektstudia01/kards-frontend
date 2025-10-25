import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enJSON from "./en.json";
import plJSON from "./pl.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    debug: false,

    resources: {
      en: { translation: enJSON },
      pl: { translation: plJSON },
    },
    fallbackLng: "en",
    defaultNS: "translation",

    interpolation: { escapeValue: false },
    // parseMissingKeyHandler: () => {
    //   return i18n.t("errors.internal_server_error");
    // },
  });

export default i18n;
