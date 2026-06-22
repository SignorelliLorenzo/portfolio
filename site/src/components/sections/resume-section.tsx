"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";
import { Reveal } from "@/lib/motion-primitives";
import {
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";
import type { LandingCopy } from "@/lib/landing-copy";
import { useReactToPrint } from "react-to-print";

type ResumeCopy = LandingCopy["resumePage"];

interface ResumeSectionProps {
  copy: ResumeCopy;
}

const PURPLE = "#7c6fbf";
const PURPLE_60 = "rgba(124,111,191,0.6)";
const PURPLE_70 = "rgba(124,111,191,0.7)";
const PURPLE_40 = "rgba(124,111,191,0.4)";
const PURPLE_25 = "rgba(124,111,191,0.25)";
const PURPLE_50 = "rgba(124,111,191,0.5)";

export function ResumeSection({ copy }: ResumeSectionProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: "Lorenzo_Signorelli_Resume",
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="w-[210mm] max-w-full mx-auto">

          <Reveal className="flex justify-end mb-3">
            <motion.button
              onClick={() => handlePrint()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors print:hidden"
            >
              <FaDownload size={13} />
              {copy.downloadPdf}
            </motion.button>
          </Reveal>

          <Reveal>
            <div
              ref={resumeRef}
              className="w-[210mm] max-w-full rounded-lg shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
              style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
            >
            <div className="relative h-[297mm] grid grid-cols-[225px_1fr] print:grid-cols-[215px_1fr]">

              {/* ─── SIDEBAR ─── */}
              <div
                className="flex flex-col border-2 rounded-l-lg pt-4 pb-4"
                style={{ backgroundColor: "#0e0b1e", color: "#fff", borderColor: "rgba(255,255,255,0.15)" }}
              >

                {/* Header block */}
                <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-[130px] h-[130px] rounded-lg overflow-hidden mb-3" style={{ boxShadow: `0 0 0 2px ${PURPLE_40}` }}>
                    <img
                      src="/developer-headshot.png"
                      alt="Lorenzo Signorelli"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-[19px] font-bold leading-[1.2] tracking-[-0.01em]" style={{ color: "#fff" }}>
                    Lorenzo Signorelli
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mt-1.5" style={{ color: PURPLE }}>
                    {copy.subtitle}
                  </p>
                </div>

                {/* Sidebar body */}
                <div className="flex-1 flex flex-col justify-between px-5 py-4">

                  {/* Contact */}
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Contact
                    </h2>
                    <div className="space-y-[9px]">
                      {([
                        { Icon: FaEnvelope, href: "mailto:signorelli.lorenzo.business@gmail.com", text: "signorelli.lorenzo.business@gmail.com", breakAll: true },
                        { Icon: FaPhone, href: "tel:+393355860184", text: "+39 335 586 0184" },
                        { Icon: FaMapMarkerAlt, text: "Bergamo, Italy" },
                        { Icon: FaLinkedin, href: "https://www.linkedin.com/in/lorenzo-signorelli-is-a-dev", text: "lorenzo-signorelli-is-a-dev", external: true },
                        { Icon: FaGithub, href: "https://github.com/SignorelliLorenzo", text: "SignorelliLorenzo", external: true },
                        { Icon: FaGlobe, href: "https://lorenzosignorelli.dev", text: "lorenzosignorelli.dev", external: true },
                      ] as const).map(({ Icon, href, text, breakAll, external }, idx) => {
                        const inner = (
                          <>
                            <span style={{ color: PURPLE_60, display: "inline-flex", width: 11, height: 11, minWidth: 11, flexShrink: 0, marginTop: breakAll ? 2 : 0 }}>
                              <Icon size={11} style={{ width: 11, height: 11 }} />
                            </span>
                            <span className={breakAll ? "break-all leading-snug" : ""}>{text}</span>
                          </>
                        );
                        const cls = `flex items-center gap-2.5 text-[10.5px]`;
                        const s = { color: "rgba(255,255,255,0.55)" };
                        return href ? (
                          <a key={idx} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cls} style={s}>{inner}</a>
                        ) : (
                          <span key={idx} className={cls} style={s}>{inner}</span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {copy.skills.title}
                    </h2>
                    <div className="space-y-3.5">
                      {copy.skills.categories.map((cat, i) => (
                        <div key={i}>
                          <h3 className="text-[9.5px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: PURPLE_50 }}>
                            {cat.name}
                          </h3>
                          <p className="text-[10.5px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {cat.items.join(" · ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {copy.languages.title}
                    </h2>
                    <div className="space-y-2">
                      {copy.languages.items.map((lang, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{lang.name}</span>
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {copy.interests.title}
                    </h2>
                    <div className="space-y-3">
                      {copy.interests.items.map((interest, i) => (
                        <div key={i}>
                          <h3 className="text-[10.5px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{interest.name}</h3>
                          <p className="text-[9.5px] leading-[1.7] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{interest.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── MAIN CONTENT ─── */}
              <div
                className="py-8 px-7 border-2 border-l-0 rounded-r-lg"
                style={{ backgroundColor: "#13102a", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)" }}
              >

                {/* Profile */}
                <div className="mb-5">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {copy.profile.title}
                  </h2>
                  <p className="text-[12.5px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {copy.profile.text}
                  </p>
                </div>

                {/* Experience */}
                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {copy.experience.title}
                </h2>

                <div className="relative ml-1">
                  <div className="space-y-[14px]">
                    {copy.experience.items.map((item, i) => (
                      <div key={i} className="relative pl-7">
                        {/* Dashed line above first dot */}
                        {i === 0 && (
                          <div className="absolute h-[18px] w-0" style={{ left: "3.5px", bottom: "calc(100% - 6px)", borderLeft: `2px dashed ${PURPLE_25}` }} />
                        )}
                        {/* Solid line connecting to next dot */}
                        {i < copy.experience.items.length - 1 && (
                          <div className="absolute" style={{ left: "3.5px", top: "16px", bottom: "-14px", width: "2px", backgroundColor: PURPLE_40 }} />
                        )}
                        {/* Dot */}
                        <div className="absolute rounded-full z-10" style={{ left: "-0.5px", top: "6px", width: "10px", height: "10px", border: `2.5px solid ${PURPLE}`, backgroundColor: "#13102a" }} />
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-[12.5px] font-bold leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
                            {item.role}
                          </h3>
                          <span className="text-[9.5px] whitespace-nowrap tabular-nums shrink-0 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {item.period}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold mt-[2px]" style={{ color: PURPLE_70 }}>
                          {item.company} · {item.location}
                        </p>
                        <p className="text-[11px] leading-[1.75] mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                </div>

                {/* Education */}
                <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {copy.education.title}
                </h2>

                <div className="relative ml-1">
                  <div className="space-y-[14px]">
                    {copy.education.items.map((item, i) => (
                      <div key={i} className="relative pl-7">
                        {/* Dashed line above first dot */}
                        {i === 0 && (
                          <div className="absolute h-[18px] w-0" style={{ left: "3.5px", bottom: "calc(100% - 6px)", borderLeft: `2px dashed ${PURPLE_25}` }} />
                        )}
                        {/* Solid line connecting to next dot */}
                        {i < copy.education.items.length - 1 && (
                          <div className="absolute" style={{ left: "3.5px", top: "16px", bottom: "-14px", width: "2px", backgroundColor: PURPLE_40 }} />
                        )}
                        {/* Dot */}
                        <div className="absolute rounded-full z-10" style={{ left: "-0.5px", top: "6px", width: "10px", height: "10px", border: `2.5px solid ${PURPLE}`, backgroundColor: "#13102a" }} />
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-[12.5px] font-bold leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
                            {item.degree}
                          </h3>
                          <span className="text-[9.5px] whitespace-nowrap tabular-nums shrink-0 font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {item.period}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold mt-[2px]" style={{ color: PURPLE_70 }}>
                          {item.institution} · {item.location}
                        </p>
                        <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{item.grade}</p>
                      </div>
                    ))}
                  </div>
                </div>
                </div>

              </div>
            </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
