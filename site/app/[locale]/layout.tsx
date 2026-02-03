import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";
import { LandingCopyProvider } from "@/components/providers/landing-copy-provider";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "it" }];
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = params.locale;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  return (
    <LandingCopyProvider locale={locale} copy={copy}>
      {children}
    </LandingCopyProvider>
  );
}
