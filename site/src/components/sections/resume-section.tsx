"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";
import { Reveal } from "@/lib/motion-primitives";
import { FaDownload } from "react-icons/fa";
import type { LandingCopy } from "@/lib/landing-copy";
import type { Locale } from "@/lib/i18n";
import { ResumeDocument } from "@/components/sections/resume-document";
import { PALETTES, getPalette, rgba } from "@/lib/resume-palettes";

type ResumeCopy = LandingCopy["resumePage"];

interface ResumeSectionProps {
  copy: ResumeCopy;
  locale: Locale;
}

export function ResumeSection({ copy, locale }: ResumeSectionProps) {
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const p = getPalette(paletteId);

  const pdfHref = `/api/resume/pdf?locale=${locale}&palette=${paletteId}`;
  const fileName = `Lorenzo_Signorelli_CV_${locale.toUpperCase()}.pdf`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="w-[210mm] max-w-full mx-auto">

          <Reveal className="flex flex-wrap items-center justify-between gap-3 mb-3 print:hidden">
            {/* Palette switcher */}
            <div className="flex items-center gap-2">
              {PALETTES.map((pl) => {
                const active = pl.id === p.id;
                return (
                  <motion.button
                    key={pl.id}
                    onClick={() => setPaletteId(pl.id)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={active}
                    aria-label={pl.label}
                    title={pl.label}
                    className={`flex items-center justify-center rounded-full p-[3px] border-2 transition-colors ${
                      active ? "border-accent" : "border-transparent hover:border-border"
                    }`}
                  >
                    <span
                      className="block w-5 h-5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${pl.sidebarBg} 0 50%, ${rgba(pl.accent, 1)} 50% 100%)`,
                        boxShadow: "inset 0 0 0 1px rgba(128,128,128,0.35)",
                      }}
                    />
                  </motion.button>
                );
              })}
            </div>

            <motion.a
              href={pdfHref}
              download={fileName}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              <FaDownload size={13} />
              {copy.downloadPdf}
            </motion.a>
          </Reveal>

          {/* Mobile: skip the heavy A4 preview, offer the generated PDF instead */}
          <div className="md:hidden rounded-lg border border-border bg-card/40 px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {copy.mobileHint}
            </p>
            <motion.a
              href={pdfHref}
              download={fileName}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              <FaDownload size={13} />
              {copy.downloadPdf}
            </motion.a>
          </div>

          {/* Live preview (desktop only — the PDF itself is rendered server-side) */}
          <Reveal className="hidden md:block">
            <ResumeDocument copy={copy} palette={p} />
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
