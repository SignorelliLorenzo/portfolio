export type Step = {
  id: number;
  number: string;
  title: string;
  description: string;
  cta: string;
};

export const steps: Step[] = [
  {
    id: 1,
    number: "01",
    title: "Discover",
    description:
      "Align goals, stakeholders, and constraints to define requirements and clear success criteria.",
    cta: "Next",
  },
  {
    id: 2,
    number: "02",
    title: "Build",
    description:
      "Design and build robust solutions with clean architecture, best practices, and high code quality.",
    cta: "Next",
  },
  {
    id: 3,
    number: "03",
    title: "Iterate",
    description:
      "Validate through testing, feedback, and metrics; continuously improve UX, performance, and reliability.",
    cta: "Next",
  },
  {
    id: 4,
    number: "04",
    title: "Ship",
    description:
      "Release to production with CI/CD, monitoring, documentation, and ongoing support.",
    cta: "Launch",
  },
];
