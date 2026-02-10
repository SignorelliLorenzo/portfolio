export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  image: string | null;
  tags: string[];
  markdown?: string | null;
  github?: string | null;
  demo?: string | null;
  features?: string[] | null;
  featured?: boolean;
  hasItalianTranslation?: boolean;
}
