"use client";

import { createContext, useContext, ReactNode } from "react";
import { Locale } from "@/lib/i18n";
import { LandingCopy } from "@/lib/landing-copy";

interface LandingCopyContextValue {
  locale: Locale;
  copy: LandingCopy;
}

const LandingCopyContext = createContext<LandingCopyContextValue | null>(null);

interface LandingCopyProviderProps extends LandingCopyContextValue {
  children: ReactNode;
}

export function LandingCopyProvider({ locale, copy, children }: LandingCopyProviderProps) {
  return (
    <LandingCopyContext.Provider value={{ locale, copy }}>
      {children}
    </LandingCopyContext.Provider>
  );
}

export function useLandingCopy() {
  const context = useContext(LandingCopyContext);
  if (!context) {
    throw new Error("useLandingCopy must be used within a LandingCopyProvider");
  }

  return context;
}

export function useLandingCopyOptional() {
  return useContext(LandingCopyContext);
}
