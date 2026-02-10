# Component Architecture

This directory contains all reusable components and sections for the portfolio application.

## Directory Structure

```
components/
├── components/          # Reusable building blocks
│   ├── navigation/     # Navigation-related components
│   ├── layout/         # Layout wrapper components
│   ├── effects/        # Visual effects and backgrounds
│   ├── content/        # Content display components
│   ├── ui/             # Base UI primitives (button, card, toast)
│   └── providers/      # React context providers
├── sections/           # Full-page sections
├── styles/             # Section-specific CSS files
└── deprecated/         # Unused legacy components
```

## Component Categories

### Navigation (`components/navigation/`)
- **navbar.tsx** - Main navigation bar with links and language switcher
- **language-switcher.tsx** - Locale toggle component
- **scrolltop.tsx** - Scroll-to-top button utility

### Layout (`components/layout/`)
- **footer.tsx** - Site footer with links and contact info
- **theme-provider.tsx** - Dark/light theme context provider

### Effects (`components/effects/`)
- **background-effect.tsx** - Global background visual effects
- **neural-background.tsx** - Animated neural network background for hero
- **step-connector.tsx** - Animated connector between steps in the process section

### Content (`components/content/`)
- **markdown-renderer.tsx** - Renders markdown content with syntax highlighting
- **project-card.tsx** - Project preview card component
- **step-card.tsx** - Individual step card used in the process section

### UI (`components/ui/`)
Base UI primitives built with Radix UI and styled with Tailwind:
- **button.tsx** - Button component with variants
- **card.tsx** - Card container component
- **toast.tsx** - Toast notification component

### Providers (`components/providers/`)
- **landing-copy-provider.tsx** - i18n context provider for translated content

## Sections (`sections/`)

Full-page sections that compose the application:
- **hero-section.tsx** - Landing/hero section with profile
- **capabilities-section.tsx** - Skills and capabilities showcase
- **featured-projects-section.tsx** - Featured projects grid
- **proof-strip-section.tsx** - Metrics and achievements
- **how-i-work-section.tsx** - Process/workflow section
- **contact-section.tsx** - Contact form page
- **process-section.tsx** - Detailed process explanation
- **sticky-spotlight-section.tsx** - Projects with sticky spotlight effect

## Styling Approach

### Tailwind CSS (Primary)
Most components use Tailwind utility classes for styling. This provides:
- Consistent design system
- Rapid development
- Small bundle size
- Easy responsive design

### Dedicated CSS Files (`styles/`)
For complex sections with many styles, dedicated CSS files are available:
- `hero-section.css`
- `contact-section.css`
- `how-i-work-section.css`

These can be imported directly in components or globally.

## Component Guidelines

### 1. Keep Components Small
Each component should have a single, clear responsibility. If a component grows beyond ~200 lines, consider breaking it into smaller pieces.

### 2. Use TypeScript
All components must be fully typed with proper interfaces for props.

### 3. Accessibility First
- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

### 4. Performance
- Use `"use client"` directive only when necessary
- Lazy load heavy components
- Optimize images and assets
- Minimize re-renders with proper memoization

### 5. Naming Conventions
- Components: PascalCase (e.g., `HeroSection`)
- Files: kebab-case (e.g., `hero-section.tsx`)
- CSS classes: kebab-case with section prefix (e.g., `hero-title`)

### 6. Import Aliases
Use TypeScript path aliases for clean imports:
```tsx
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
```

## Adding New Components

### For Reusable Components:
1. Determine the appropriate category (navigation, layout, effects, content, ui)
2. Create the component file in the correct subdirectory
3. Export the component with proper TypeScript types
4. Update this README if adding a new category

### For New Sections:
1. Create the section file in `sections/`
2. If complex, create a dedicated CSS file in `styles/`
3. Import and use in the appropriate page component
4. Ensure responsive design and accessibility

## Deprecated Components

The `deprecated/` folder contains unused components that may be needed in the future:
- Legacy UI components (dialog, input, label, separator, sheet, skeleton, toggle, tooltip)
- Unused effects (neon-spheres, theme-toggle)
- Unused content (project-timeline)

These are kept for reference but should not be imported in active code.

## i18n Integration

Components that display user-facing text should use the `useLandingCopyOptional()` hook:

```tsx
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

export function MySection() {
  const landingCopy = useLandingCopyOptional();
  const copy = landingCopy?.copy.mySection;
  
  return <h1>{copy?.title ?? "Default Title"}</h1>;
}
```

This ensures all text is translatable and supports multiple locales.

## Testing

When modifying components:
1. Test in both light and dark themes
2. Verify responsive behavior on mobile, tablet, and desktop
3. Check accessibility with keyboard navigation
4. Ensure i18n works for all supported locales
5. Test animations and interactions

## Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Next.js App Router](https://nextjs.org/docs/app)
