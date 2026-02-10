"use client";

import { motion } from "framer-motion";

interface StepConnectorProps {
  direction: "horizontal" | "vertical";
  isActive: boolean;
  reducedMotion: boolean;
  className?: string;
  showOnMobile?: boolean;
}

export function StepConnector({
  direction,
  isActive,
  reducedMotion,
  className,
  showOnMobile = false,
}: StepConnectorProps) {
  if (direction === "horizontal") {
    return (
      <div
        className={`hidden lg:flex items-center justify-center w-14 shrink-0 relative ${className ?? ""}`}
      >
        {/* Track */}
        <div className="w-full h-px bg-white/[0.06]" />
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 right-0 flex items-center"
          initial={false}
        >
          <motion.div
            className="h-px bg-gradient-to-r from-indigo-500/60 via-indigo-400/40 to-indigo-500/20 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isActive ? 1 : 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: "easeOut",
            }}
            style={{ width: "100%" }}
          />
        </motion.div>
        {/* Dot at midpoint */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          animate={{
            backgroundColor: isActive
              ? "rgba(99,102,241,0.7)"
              : "rgba(255,255,255,0.1)",
            scale: isActive ? 1 : 0.6,
          }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        />
      </div>
    );
  }

  // Vertical connector
  return (
    <div
      className={`${
        showOnMobile ? "flex" : "hidden lg:flex"
      } justify-center py-3 relative ${className ?? ""}`}
    >
      <div className="h-12 w-px bg-white/[0.08] relative overflow-hidden">
        <motion.div
          className="w-full bg-gradient-to-b from-indigo-500/60 to-indigo-500/20 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isActive ? 1 : 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.5,
            ease: "easeOut",
          }}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
