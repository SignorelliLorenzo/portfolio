# Component Styles

This directory contains dedicated CSS files for section components. These styles are extracted from inline Tailwind classes to improve maintainability and readability.

## Available Styles

### `hero-section.css`
Styles for the hero/landing section including:
- Neural background effects
- Profile image flip animation
- Tech stack badges
- Contact links
- Responsive layout

### `contact-section.css`
Styles for the contact form section including:
- Form layout and inputs
- Validation states
- Submit button states
- Success/error messages
- Responsive design

### `how-i-work-section.css`
Styles for the process/workflow section including:
- Section header
- Step container layout
- Responsive typography

## Usage

Import these CSS files in the respective section components:

```tsx
import './styles/hero-section.css';
```

Or import globally in `app/globals.css` if needed across multiple sections.

## Guidelines

1. **Keep styles scoped** - Use specific class names prefixed with the section name
2. **Mobile-first** - Use min-width media queries for responsive design
3. **Use CSS variables** - Reference theme colors from global CSS when possible
4. **Avoid duplication** - Extract common patterns into shared utility classes
5. **Document complex styles** - Add comments for non-obvious styling decisions
