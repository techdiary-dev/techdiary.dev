"use server";

import { cookies } from "next/headers";
import bn from "@/i18n/bn.json";

const dictionaries: {
  [key: string]: any;
} = { bn };

const _t = async (key: string, placeholderValues?: (string | number)[]) => {
  const cookiesStore = await cookies();
  const _lang = cookiesStore.get("language")?.value || "en";
  let translation = dictionaries[_lang]?.[key] || key;

  if (placeholderValues && placeholderValues.length > 0) {
    placeholderValues.forEach((value) => {
      translation = translation.replace("$", String(value));
    });
  }

  return translation;
};

export const getLang = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get("language")?.value || "en";
};

export default _t;
