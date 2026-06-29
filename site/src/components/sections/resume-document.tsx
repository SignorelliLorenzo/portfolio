import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";
import type { LandingCopy } from "@/lib/landing-copy";
import { type Palette, rgba } from "@/lib/resume-palettes";

type ResumeCopy = LandingCopy["resumePage"];

interface ResumeDocumentProps {
  copy: ResumeCopy;
  palette: Palette;
}

/**
 * Presentational A4 résumé card. No interactivity, so it can be rendered both
 * in the interactive preview (ResumeSection) and on the server-side print route
 * that the PDF endpoint screenshots with headless Chromium.
 */
export function ResumeDocument({ copy, palette: p }: ResumeDocumentProps) {
  const ACCENT = rgba(p.accent, 1);
  const ACCENT_60 = rgba(p.accent, 0.6);
  const ACCENT_50 = rgba(p.accent, 0.5);
  const ACCENT_40 = rgba(p.accent, 0.4);
  const ACCENT_25 = rgba(p.accent, 0.25);
  const S = (a: number) => rgba(p.sidebarFg, a);
  const M = (a: number) => rgba(p.mainFg, a);
  const AT = (a: number) => rgba(p.accentText, a); // accent-colored text (readable on any bg)

  return (
    <div
      className="w-[210mm] max-w-full rounded-lg shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
    >
      <div className="relative h-[297mm] grid grid-cols-[225px_1fr] print:grid-cols-[215px_1fr]">

        {/* ─── SIDEBAR ─── */}
        <div
          className="flex flex-col border-2 rounded-l-lg print:rounded-none pt-4 pb-4 relative overflow-hidden"
          style={{ backgroundColor: p.sidebarBg, color: p.sidebarStrong, borderColor: S(0.12) }}
        >
          {/* Subtle sidebar gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none" style={{ background: `linear-gradient(180deg, ${ACCENT_25} 0%, transparent 100%)`, opacity: 0.15 }} />

          {/* Header block */}
          <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center relative" style={{ borderBottom: `1px solid ${S(0.06)}` }}>
            <div className="w-[130px] h-[130px] rounded-xl overflow-hidden mb-3" style={{ boxShadow: `0 0 0 2.5px ${ACCENT_50}, 0 8px 24px -8px rgba(0,0,0,0.6)` }}>
              <img
                src="/developer-headshot.png"
                alt="Lorenzo Signorelli"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-[19px] font-bold leading-[1.2] tracking-[-0.02em]" style={{ color: p.sidebarStrong }}>
              Lorenzo Signorelli
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mt-1.5" style={{ color: AT(1) }}>
              {copy.subtitle}
            </p>
          </div>

          {/* Sidebar body */}
          <div className="flex-1 flex flex-col justify-between px-5 py-4">

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[2.5px] h-[11px] rounded-full" style={{ backgroundColor: ACCENT_60 }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: S(0.4) }}>
                  Contact
                </h2>
              </div>
              <div className="space-y-[9px]">
                {([
                  { Icon: FaEnvelope, href: "mailto:signorelli.lorenzo.business@gmail.com", text: "signorelli.lorenzo.business@gmail.com", breakAll: true },
                  { Icon: FaPhone, href: "tel:+393355860184", text: "+39 335 586 0184" },
                  { Icon: FaMapMarkerAlt, text: "Bergamo, Italy" },
                  { Icon: FaLinkedin, href: "https://www.linkedin.com/in/lorenzo-signorelli-is-a-dev", text: "lorenzo-signorelli-is-a-dev", external: true },
                  { Icon: FaGithub, href: "https://github.com/SignorelliLorenzo", text: "SignorelliLorenzo", external: true },
                  { Icon: FaGlobe, href: "https://lorenzo-signorelli.is-a.dev", text: "lorenzo-signorelli.is-a.dev", external: true },
                ] as Array<{ Icon: typeof FaEnvelope; href?: string; text: string; breakAll?: boolean; external?: boolean }>).map(({ Icon, href, text, breakAll, external }, idx) => {
                  const inner = (
                    <>
                      <span style={{ color: ACCENT_60, display: "inline-flex", width: 11, height: 11, minWidth: 11, flexShrink: 0, marginTop: breakAll ? 2 : 0 }}>
                        <Icon size={11} style={{ width: 11, height: 11 }} />
                      </span>
                      <span className={breakAll ? "break-all leading-snug" : ""}>{text}</span>
                    </>
                  );
                  const cls = `flex items-center gap-2.5 text-[10.5px]`;
                  const s = { color: S(0.55) };
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
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-[2.5px] h-[11px] rounded-full" style={{ backgroundColor: ACCENT_60 }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: S(0.4) }}>
                  {copy.skills.title}
                </h2>
              </div>
              <div className="space-y-3.5">
                {copy.skills.categories.map((cat, i) => (
                  <div key={i}>
                    <h3 className="text-[9.5px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: AT(0.75) }}>
                      {cat.name}
                    </h3>
                    <p className="text-[10.5px] leading-[1.7]" style={{ color: M(0.5) }}>
                      {cat.items.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-[2.5px] h-[11px] rounded-full" style={{ backgroundColor: ACCENT_60 }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: S(0.4) }}>
                  {copy.languages.title}
                </h2>
              </div>
              <div className="space-y-2.5">
                {copy.languages.items.map((lang, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium" style={{ color: S(0.55) }}>{lang.name}</span>
                      <span className="text-[9.5px]" style={{ color: S(0.3) }}>{lang.level}</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: S(0.08) }}>
                      <div className="h-full rounded-full" style={{ width: lang.name === "Italian" || lang.name === "Italiano" ? "100%" : lang.name === "English" || lang.name === "Inglese" ? "95%" : "40%", backgroundColor: ACCENT_50 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-[2.5px] h-[11px] rounded-full" style={{ backgroundColor: ACCENT_60 }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: S(0.4) }}>
                  {copy.interests.title}
                </h2>
              </div>
              <div className="space-y-3">
                {copy.interests.items.map((interest, i) => (
                  <div key={i}>
                    <h3 className="text-[10.5px] font-medium" style={{ color: S(0.55) }}>{interest.name}</h3>
                    <p className="text-[9.5px] leading-[1.7] mt-0.5" style={{ color: S(0.3) }}>{interest.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div
          className="pt-5 pb-0 px-7 border-2 border-l-0 rounded-r-lg print:rounded-none"
          style={{ backgroundColor: p.mainBg, borderColor: M(0.12), color: p.mainStrong }}
        >

          {/* Profile */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-[3px] h-[14px] rounded-full" style={{ backgroundColor: ACCENT }} />
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: M(0.5) }}>
                {copy.profile.title}
              </h2>
            </div>
            <p className="text-[12.5px] leading-[1.8]" style={{ color: M(0.65) }}>
              {copy.profile.text}
            </p>
          </div>

          {/* Experience */}
          <div className="pt-4" style={{ borderTop: `1px solid ${M(0.08)}` }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-[3px] h-[14px] rounded-full" style={{ backgroundColor: ACCENT }} />
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: M(0.5) }}>
              {copy.experience.title}
            </h2>
          </div>

          <div className="relative ml-1">
            <div className="space-y-[14px]">
              {copy.experience.items.map((item, i) => (
                <div key={i} className="relative pl-7">
                  {/* Dashed line above first dot */}
                  {i === 0 && (
                    <div className="absolute h-[18px] w-0" style={{ left: "3.5px", bottom: "calc(100% - 6px)", borderLeft: `2px dashed ${ACCENT_25}` }} />
                  )}
                  {/* Solid line connecting to next dot */}
                  {i < copy.experience.items.length - 1 && (
                    <div className="absolute" style={{ left: "3.5px", top: "16px", bottom: "-14px", width: "2px", backgroundColor: ACCENT_40 }} />
                  )}
                  {/* Dot */}
                  <div className="absolute rounded-full z-10" style={{ left: "-0.5px", top: "6px", width: "10px", height: "10px", border: `2.5px solid ${ACCENT}`, backgroundColor: p.mainBg }} />
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[12.5px] font-bold leading-snug" style={{ color: p.mainStrong }}>
                      {item.role}
                    </h3>
                    <span className="text-[9.5px] whitespace-nowrap tabular-nums shrink-0 font-medium" style={{ color: M(0.35) }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold mt-[2px]" style={{ color: AT(0.8) }}>
                    {item.company} · {item.location}
                  </p>
                  <p className="text-[11px] leading-[1.75] mt-1.5" style={{ color: M(0.6) }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Education */}
          <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${M(0.08)}` }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-[3px] h-[14px] rounded-full" style={{ backgroundColor: ACCENT }} />
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: M(0.5) }}>
              {copy.education.title}
            </h2>
          </div>

          <div className="relative ml-1">
            <div className="space-y-[14px]">
              {copy.education.items.map((item, i) => (
                <div key={i} className="relative pl-7">
                  {/* Dashed line above first dot */}
                  {i === 0 && (
                    <div className="absolute h-[18px] w-0" style={{ left: "3.5px", bottom: "calc(100% - 6px)", borderLeft: `2px dashed ${ACCENT_25}` }} />
                  )}
                  {/* Solid line connecting to next dot */}
                  {i < copy.education.items.length - 1 && (
                    <div className="absolute" style={{ left: "3.5px", top: "16px", bottom: "-14px", width: "2px", backgroundColor: ACCENT_40 }} />
                  )}
                  {/* Dot */}
                  <div className="absolute rounded-full z-10" style={{ left: "-0.5px", top: "6px", width: "10px", height: "10px", border: `2.5px solid ${ACCENT}`, backgroundColor: p.mainBg }} />
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[12.5px] font-bold leading-snug" style={{ color: p.mainStrong }}>
                      {item.degree}
                    </h3>
                    <span className="text-[9.5px] whitespace-nowrap tabular-nums shrink-0 font-medium" style={{ color: M(0.35) }}>
                      {item.period}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold mt-[2px]" style={{ color: AT(0.8) }}>
                    {item.institution} · {item.location}
                  </p>
                  <p className="text-[10.5px] mt-1" style={{ color: M(0.45) }}>{item.grade}</p>
                </div>
              ))}
            </div>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
}
