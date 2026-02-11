"use client";

import { motion } from "framer-motion";

interface ProjectDetailFeaturesProps {
  features: string[];
}

export function ProjectDetailFeatures({ features }: ProjectDetailFeaturesProps) {
  if (!features.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mt-12"
    >
      <h2 className="text-2xl font-semibold text-white mb-4">Key Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {features.slice(0, 10).map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 via-white/2 to-transparent text-white shadow-[0_18px_48px_rgba(0,0,0,0.45)] p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" aria-hidden />
            <div className="relative text-sm font-medium text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">
              {feature}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
