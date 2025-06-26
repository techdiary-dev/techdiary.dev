import bn from "@/i18n/bn.json";
import { i18nLangAtom } from "@/store/i18n-lang.atom";
import { useAtom } from "jotai";
import { setLanguage } from "./i18n.server-action";
const dictionaries: {
  [key: string]: any;
} = { bn };

export const useTranslation = () => {
  const [lang, setLang] = useAtom(i18nLangAtom);
  return {
    _t: (key: string, placeholderValues?: (string | number)[]) => {
      let translation = dictionaries?.[lang || "en"]?.[key] || key;

      if (placeholderValues && placeholderValues.length > 0) {
        placeholderValues.forEach((value) => {
          translation = translation.replace("$", String(value));
        });
      }

      return translation;
    },
    lang,
    toggle: async () => {
      setLang(lang === "en" ? "bn" : "en");
      await setLanguage(lang === "en" ? "bn" : "en");
    },
  };
};
