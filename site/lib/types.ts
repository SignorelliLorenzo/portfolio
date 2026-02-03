export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  image: string;
  tags: string[];
  markdown?: string | null;
  github?: string | null;
  demo?: string | null;
  features?: string[] | null;
  featured?: boolean;
  hasItalianTranslation?: boolean;
}
