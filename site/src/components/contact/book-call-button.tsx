"use client";

import { useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import { FaRegCalendarCheck } from "react-icons/fa";

interface BookCallButtonProps {
  /** Calendly scheduling URL, e.g. https://calendly.com/your-name/intro-call */
  url: string;
  label: string;
}

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

/**
 * Opens a Calendly scheduling popup. The widget script/CSS load lazily and the
 * popup is triggered on click — nothing from Calendly loads until it's ready.
 */
export function BookCallButton({ url, label }: BookCallButtonProps) {
  const [ready, setReady] = useState(false);

  const openPopup = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
    }
  };

  return (
    <>
      {/* React 19 hoists this stylesheet into <head> */}
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <motion.button
        type="button"
        onClick={openPopup}
        disabled={!ready}
        whileHover={{ scale: ready ? 1.02 : 1 }}
        whileTap={{ scale: ready ? 0.98 : 1 }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-accent/40 bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <FaRegCalendarCheck />
        {label}
      </motion.button>
    </>
  );
}
