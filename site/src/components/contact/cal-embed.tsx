"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
  /** Cal.com link, e.g. "lorenzo-signorelli/intro" */
  calLink: string;
}

// Warm accent matching the site theme (oklch(0.78 0.12 70)).
const BRAND_COLOR = "#c49a6c";

/**
 * Inline Cal.com scheduler, themed to the site. Availability, "requires
 * confirmation" (approve/decline), reminders, and Meet links are all managed
 * in the Cal.com dashboard — nothing to maintain here.
 */
export function CalEmbed({ calLink }: CalEmbedProps) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          light: { "cal-brand": BRAND_COLOR },
          dark: { "cal-brand": BRAND_COLOR },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%", minHeight: "620px", overflow: "scroll" }}
        config={{ theme: "dark", layout: "month_view" }}
      />
    </div>
  );
}
