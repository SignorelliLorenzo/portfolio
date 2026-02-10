"use client";

import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";

interface ProjectMarkdownProps {
  markdown: string;
  projectId?: string;
}

export default function ProjectMarkdown({ markdown, projectId }: ProjectMarkdownProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-10"
    >
      <MarkdownRenderer content={markdown} projectId={projectId} />
    </motion.section>
  );
}
