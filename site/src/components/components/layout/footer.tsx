"use client";

import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

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
    <footer className="border-t border-border/40 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lorenzo Signorelli. {footerCopy?.rights ?? "All rights reserved."}
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
