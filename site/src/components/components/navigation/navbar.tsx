"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

interface NavbarProps {
  hasTranslation?: boolean;
}

export function Navbar({ hasTranslation = true }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const landingCopy = useLandingCopyOptional();
  const navCopy = landingCopy?.copy.nav;
  const locale = landingCopy?.locale ?? "en";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href={`/${locale}`} className="text-xl font-bold">
            <img src="/nav-white.png" alt="Logo" className="h-12 w-auto dark:block hidden" />
            <img src="/nav-black.png" alt="Logo" className="h-12 w-auto dark:hidden block" />
          </Link>
          
          <div className="flex items-center gap-8">
            <Link
              href={`/${locale}#about`}
              className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {navCopy?.about ?? "About"}
            </Link>
            <LanguageSwitcher hasTranslation={hasTranslation} />
          </div>
        </div>
      </div>
    </nav>
  );
}
