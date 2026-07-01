"use client";

import Link from "next/link";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const EMAIL = "signorelli.lorenzo.business@gmail.com";

const SOCIALS = [
  { href: "https://github.com/SignorelliLorenzo", label: "GitHub", Icon: FaGithub },
  { href: "https://www.linkedin.com/in/lorenzo-signorelli-is-a-dev", label: "LinkedIn", Icon: FaLinkedin },
];

export function Footer() {
  const landingCopy = useLandingCopyOptional();
  const contactCopy = landingCopy?.copy.contact;
  const footerCopy = landingCopy?.copy.footer;
  const locale = landingCopy?.locale ?? "en";

  const links = [
    { href: `/${locale}#about`, label: contactCopy?.bottomLinks?.about ?? "About" },
    { href: `/${locale}/projects`, label: contactCopy?.bottomLinks?.projects ?? "Projects" },
    { href: `/${locale}/resume`, label: contactCopy?.bottomLinks?.resume ?? "Resume" },
    { href: `/${locale}/contact`, label: locale === "it" ? "Contatti" : "Contact" },
  ];

  return (
    <footer id="contact" className="relative border-t border-border/30 w-full">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Identity + email */}
          <div>
            <p className="text-lg font-semibold text-foreground">Lorenzo Signorelli</p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-2 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaEnvelope size={14} />
              {EMAIL}
            </a>
          </div>

          {/* Links + social */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-foreground/70 hover:bg-white/[0.10] hover:text-foreground transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full border-t border-border/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lorenzo Signorelli. {footerCopy?.rights ?? "All rights reserved."}</p>
          <p>Bergamo, Italy</p>
        </div>
      </div>
    </footer>
  );
}
