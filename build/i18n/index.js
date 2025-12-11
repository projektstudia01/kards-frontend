"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_browser_languagedetector_1 = __importDefault(require("i18next-browser-languagedetector"));
const react_i18next_1 = require("react-i18next");
const en_json_1 = __importDefault(require("./en.json"));
const pl_json_1 = __importDefault(require("./pl.json"));
i18next_1.default
    .use(react_i18next_1.initReactI18next)
    .use(i18next_browser_languagedetector_1.default)
    .init({
    debug: false,
    resources: {
        en: { translation: en_json_1.default },
        pl: { translation: pl_json_1.default },
    },
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    // parseMissingKeyHandler: () => {
    //   return i18n.t("errors.internal_server_error");
    // },
});
exports.default = i18next_1.default;
