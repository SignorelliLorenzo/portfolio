import type { Metadata } from "next";
import { getLandingCopy } from "@/lib/landing-copy";
import type { Locale } from "@/lib/i18n";
import { ResumeDocument } from "@/components/sections/resume-document";
import { getPalette } from "@/lib/resume-palettes";

// Bare A4 document with no site chrome — this is the page the PDF endpoint
// renders with headless Chromium. Kept out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface PrintPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ palette?: string }>;
}

export default async function ResumePrintPage({ params, searchParams }: PrintPageProps) {
  const { locale } = await params;
  const { palette } = await searchParams;
  const copy = getLandingCopy(locale);

  return (
    <div className="w-[210mm] mx-auto">
      <ResumeDocument copy={copy.resumePage} palette={getPalette(palette)} />
    </div>
  );
}
