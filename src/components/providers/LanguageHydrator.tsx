import { cookies } from "next/headers";
import I18nProvider from "./I18nProvider";

const LanguageHydrator = async () => {
  const _cookies = await cookies();
  const language = _cookies.get("language")?.value || "en";
  return <I18nProvider currentLanguage={language} />;
};

export default LanguageHydrator;
