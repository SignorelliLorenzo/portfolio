import type { Locale } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import type { Project } from "@/lib/models/project";

const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;

const localeTag = (locale: Locale) => (locale === "it" ? "it-IT" : "en-US");

/**
 * Canonical Person entity for Lorenzo Signorelli. Referenced by @id from the
 * other graphs so search/answer engines resolve everything to one identity.
 */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Lorenzo Signorelli",
    givenName: "Lorenzo",
    familyName: "Signorelli",
    url: siteUrl,
    image: absoluteUrl("/developer-headshot.jpg"),
    jobTitle: "AI Software Engineer",
    description:
      "Full-Stack Developer & AI Engineer building agentic AI systems, computer vision pipelines and high-performance web applications.",
    email: "mailto:signorelli.lorenzo.business@gmail.com",
    worksFor: [
      { "@type": "Organization", name: "Silicon Shoring Reply" },
      { "@type": "Organization", name: "DODO" },
    ],
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Milan" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bergamo",
      addressCountry: "IT",
    },
    nationality: { "@type": "Country", name: "Italy" },
    knowsLanguage: [
      { "@type": "Language", name: "Italian" },
      { "@type": "Language", name: "English" },
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Agentic AI Systems",
      "Large Language Models",
      "LangChain",
      "LangGraph",
      "Multi-Agent Systems",
      "Retrieval-Augmented Generation",
      "Computer Vision",
      "PyTorch",
      "YOLO",
      "Full-Stack Development",
      "React",
      "Next.js",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Spring Framework",
    ],
    sameAs: [
      "https://github.com/SignorelliLorenzo",
      "https://www.linkedin.com/in/lorenzo-signorelli-is-a-dev",
      "https://lorenzo-signorelli.is-a.dev",
    ],
  };
}

export function webSiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteUrl,
    name: "Lorenzo Signorelli",
    description:
      "Portfolio of Lorenzo Signorelli, full-stack developer and AI engineer building scalable web apps and intelligent products.",
    inLanguage: localeTag(locale),
    publisher: { "@id": PERSON_ID },
  };
}

/** Resume page → ProfilePage whose main entity is the Person. */
export function profilePageSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(`/${locale}/resume`),
    inLanguage: localeTag(locale),
    name: "Lorenzo Signorelli — Résumé",
    mainEntity: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Project case study → SoftwareSourceCode when there's a repo, else CreativeWork. */
export function projectSchema(project: Project, locale: Locale) {
  const projectUrl = absoluteUrl(`/${locale}/projects/${project.id}`);
  return {
    "@context": "https://schema.org",
    "@type": project.github ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    url: projectUrl,
    inLanguage: localeTag(locale),
    ...(project.image ? { image: absoluteUrl(project.image) } : {}),
    ...(project.tags?.length ? { keywords: project.tags.join(", ") } : {}),
    ...(project.github ? { codeRepository: project.github } : {}),
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
