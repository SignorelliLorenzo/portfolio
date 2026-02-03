export type Locale = "en" | "it";

export const locales: Locale[] = ["en", "it"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    return segments[0];
  }
  return defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

export function withLocale(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (locale === defaultLocale) {
    return stripped || "/";
  }
  return `/${locale}${stripped}`;
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "en" ? "it" : "en";
}
