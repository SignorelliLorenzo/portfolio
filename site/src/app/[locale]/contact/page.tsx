import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";
import type { Locale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";

const CONTACT_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Contact",
    description:
      "Get in touch with Lorenzo Signorelli for collaborations, freelance work, and full-stack or AI projects.",
  },
  it: {
    title: "Contatti",
    description:
      "Contatta Lorenzo Signorelli per collaborazioni, progetti freelance e sviluppo full-stack o AI.",
  },
};

interface ContactPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = CONTACT_METADATA[locale] ?? CONTACT_METADATA.en;
  const routePath = `/${locale}/contact`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: routePath,
      languages: {
        en: "/en/contact",
        it: "/it/contact",
        "x-default": "/en/contact",
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: routePath,
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      alternateLocale: locale === "it" ? ["en_US"] : ["it_IT"],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const copy = getLandingCopy(locale);

  return <ContactSection copy={copy.contactPage} />;
}
