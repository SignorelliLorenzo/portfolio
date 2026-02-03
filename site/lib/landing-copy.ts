import { Locale, defaultLocale } from "./i18n";
import landingEn from "@/data/i18n/landing.en.json";
import landingIt from "@/data/i18n/landing.it.json";

export type LandingCopy = typeof landingEn;

const dictionaries: Record<Locale, LandingCopy> = {
  en: landingEn,
  it: landingIt,
};

export function getLandingCopy(locale: Locale = defaultLocale): LandingCopy {
  return dictionaries[locale] || dictionaries[defaultLocale];
}
