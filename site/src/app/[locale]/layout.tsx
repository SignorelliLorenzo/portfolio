import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";
import { LandingCopyProvider } from "@/components/providers/landing-copy-provider";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "it" }];
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

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
