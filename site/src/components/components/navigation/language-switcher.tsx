"use client";

import { usePathname, useRouter } from "next/navigation";
import { getLocaleFromPathname, getOppositeLocale, withLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  hasTranslation?: boolean;
}

export function LanguageSwitcher({ hasTranslation = true }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPathname(pathname);
  const targetLocale = getOppositeLocale(currentLocale);

  const handleSwitch = () => {
    if (!hasTranslation) return;
    const newPath = withLocale(pathname, targetLocale);
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      disabled={!hasTranslation}
      className="text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      title={hasTranslation ? `Switch to ${targetLocale.toUpperCase()}` : "Translation not available"}
    >
      {targetLocale.toUpperCase()}
    </Button>
  );
}
