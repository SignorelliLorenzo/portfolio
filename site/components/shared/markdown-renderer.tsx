"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

interface MarkdownRendererProps {
  content: string;
  projectId?: string;
}

const resolveAssetSrc = (src: string | undefined, projectId?: string) => {
  if (!src) return undefined;
  if (src.startsWith("/api/assets")) return src;
  if (projectId) {
    const fileName = src.split("/").pop();
    if (fileName) {
      return `/api/assets/${projectId}/${fileName}`;
    }
  }
  return src;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  projectId,
}) => {
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className={`${GeistSans.className} text-4xl md:text-[3.4rem] font-semibold text-foreground tracking-tight mt-12 mb-6`}
        {...props}
      />
    ),

    h2: ({ node, ...props }: any) => (
      <h2
        className={`${GeistSans.className} relative text-3xl md:text-[2.65rem] font-semibold text-foreground mt-10 mb-6 pb-4 after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-24 after:bg-gradient-to-r after:from-accent after:via-accent/60 after:to-transparent`}
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className={`${GeistSans.className} text-2xl font-medium text-foreground mt-8 mb-3 tracking-wide`}
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="text-[1.05rem] leading-[1.95] text-muted-foreground mb-6"
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-inside space-y-2 pl-5 text-muted-foreground" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-2 pl-5 text-muted-foreground" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="text-muted-foreground" {...props} />
    ),
    code: ({ node, inline, className, ...props }: any) =>
      inline ? (
        <code
          className={`${GeistMono.className} bg-muted px-2 py-0.5 rounded-full text-sm text-foreground`}
          {...props}
        />
      ) : (
        <pre className="relative overflow-x-auto rounded-3xl border border-border bg-card px-5 py-6 shadow-lg">
          <code className={`${GeistMono.className} relative z-10 text-sm md:text-base text-foreground`} {...props} />
        </pre>
      ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="relative my-10 rounded-3xl border border-border bg-muted/40 px-6 py-5 text-muted-foreground shadow-lg"
        {...props}
      />
    ),
    img: ({ node, src, ...props }: any) => (
      <img
        className="rounded-[28px] border border-border shadow-lg mx-auto my-8"
        src={resolveAssetSrc(src, projectId)}
        {...props}
      />
    ),
    video: ({ node, children, ...props }: any) => (
      <video
        className="w-full rounded-[28px] border border-border shadow-lg mx-auto my-8"
        playsInline
        autoPlay={props.autoPlay ?? true}
        loop={props.loop ?? true}
        muted={props.muted ?? true}
        {...props}
      >
        {children?.length ? children : (
          <track kind="captions" />
        )}
      </video>
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-sm md:text-base text-accent font-semibold underline-offset-4 decoration-accent/30 hover:text-accent/80"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    table: ({ node, ...props }: any) => (
      <table
        className="w-full text-xs sm:text-sm border-collapse my-8 text-foreground"
        {...props}
      />
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="text-foreground font-semibold bg-muted" {...props} />
    ),
    tbody: ({ node, ...props }: any) => <tbody {...props} />,
    tr: ({ node, ...props }: any) => (
      <tr className="even:bg-muted/30" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th
        className="p-3 text-left font-semibold border-b border-border"
        {...props}
      />
    ),
    td: ({ node, ...props }: any) => (
      <td
        className="p-3 align-top border-b border-border text-muted-foreground"
        {...props}
      />
    ),
  };

  return (
    <section className="relative isolate max-w-6xl mx-auto px-4 sm:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute top-[-10%] left-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/25 via-transparent to-transparent blur-[120px]" />
        <div className="absolute bottom-[-25%] right-0 h-72 w-72 rounded-full bg-gradient-to-tl from-violet-600/25 via-transparent to-transparent blur-[160px]" />
      </div>
      <article
        className={`${GeistSans.className} relative space-y-8 text-muted-foreground tracking-[0.005em] leading-[1.9] max-w-5xl md:max-w-6xl mx-auto`}
      >
        <ReactMarkdown
          components={markdownComponents}
          rehypePlugins={[rehypeRaw]}
          remarkRehypeOptions={{ allowDangerousHtml: true }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </section>
  );
};
