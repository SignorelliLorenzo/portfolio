# Parallax Rework Plan (B + Sticky Spotlight)

## Goals
- Make the landing page feel energetic/techy with scroll-driven motion and a strong “product-like” vibe.
- Keep project details maintainable as Markdown-driven case studies with standardized animations.
- Add a dedicated Contact page with a request form that works on Vercel.

## UX Direction (B: Energetic/Techy)
- Stronger glow accents, subtle neon gradients, dynamic depth layers.
- Scroll-driven parallax for backgrounds and key visuals.
- Snappy, high-quality transitions (layout animations, crossfades) with consistent timing.
- Respect `prefers-reduced-motion` and keep performance solid on mobile.

## Information Architecture
### Routes
- `/` (Landing: parallax scroll story)
- `/projects/[id]` (Project case study, Markdown source)
- `/contact` (Contact form)
- `/api/contact` (Form submission endpoint)

## Landing Page: Section Plan
### Section 0: Hero (Intro Scene)
- Parallax background layers (grid/gradient/orbs/noise).
- Signature microinteraction (CTA hover/magnetic, subtle glow pulse).
- Scroll hint.

### Section 1: Capabilities
- 3–4 capability cards.
- Reveal + stagger animation, light parallax on icons.

### Section 2: Selected Work — Sticky Spotlight (chosen)
- Two-column layout.
  - Left: sticky “Spotlight” panel.
  - Right: scroll list of projects.
- Spotlight updates as the user scrolls through the list.
- Transitions:
  - Image crossfade (AnimatePresence).
  - Layout/opacity transitions for title, tags, bullets.
- Clicking a project navigates to `/projects/[id]`.

### Section 3: Proof Strip
- Impact counters / highlights.
- Animate once on enter.

### Section 4: Process
- 4-step process with line draw + step reveals.

### Section 5: CTA
- Strong CTA to Contact.

## Project Pages: Markdown-Driven Case Studies
### Source
- Keep long-form details in Markdown per project.
- Optional frontmatter fields for metadata (role, stack, links, metrics).

### Renderer
- Convert Markdown into standardized animated sections:
  - Reveal on scroll (once).
  - Stagger for lists.
  - Image reveal with subtle parallax.
- Keep animations centralized in the renderer so Markdown stays clean.

## Motion System (Maintainability)
Create a small set of reusable motion primitives and use them everywhere:
- `Reveal` (fade + y)
- `StaggerGroup`
- `ParallaxLayer` (speed factor)
- `StickyScene` (Spotlight pattern)

Constraints:
- Minimize continuous animations on large elements.
- Prefer `layout` animations to keep things responsive.
- Global reduced-motion support.

## Contact Page
### UX
- Fields: name, email, company (optional), subject (optional), message.
- Client-side validation + loading + success state.

### Backend options
- Preferred: email provider (Resend/Postmark/SendGrid) via `/api/contact`.
- Optional: store requests in Neon (`contact_requests` table) as well.

### Spam protection (baseline)
- Honeypot field.
- Basic rate limiting.
- Upgrade path: Turnstile/reCAPTCHA if needed.

## Implementation Milestones

### ✅ Completed
1. ✅ Built motion primitives library (`lib/motion-primitives.tsx`)
   - Reveal, StaggerGroup, ParallaxLayer, StickyScene, Counter
2. ✅ Created Capabilities section with animated cards
3. ✅ Built Sticky Spotlight projects section (replaces timeline)
4. ✅ Created Proof Strip with animated counters
5. ✅ Created Process section with line-draw animation
6. ✅ Updated main page with all new sections
7. ✅ Created Contact page UI with validation
8. ✅ Created `/api/contact` endpoint with rate limiting & honeypot

### 🔄 In Progress
9. Markdown renderer with standardized animated sections for project pages

### 📋 Remaining
10. Test contact form (run `npm run setup:contact` to create DB table)
11. Configure email provider (Resend/Postmark/SendGrid) in `/api/contact`
12. Update contact page with your actual email
13. Enhance Hero section with more energetic/techy styling (optional)
14. QA pass: mobile + performance + reduced-motion
15. Update project Markdown files with new structure (Problem/Solution/Results/Tech)

## Setup Instructions

### Contact Form Setup
1. Run `npm run setup:contact` to create the contact_requests table in Neon
2. (Optional) Configure email provider:
   - Install email SDK (e.g., `npm install resend`)
   - Add API key to `.env.local`
   - Update `/api/contact/route.ts` to send emails
3. Update your email in `app/contact/page.tsx` (line 305)

### Testing Locally
```bash
npm run dev
```

Visit:
- `/` - New parallax landing page
- `/contact` - Contact form
- `/projects/[id]` - Project case studies (still using old renderer)

## File Structure
```
components/
  ├── capabilities-section.tsx       (NEW)
  ├── sticky-spotlight-section.tsx   (NEW - replaces timeline)
  ├── proof-strip-section.tsx        (NEW)
  ├── process-section.tsx            (NEW)
  └── hero-section.tsx               (existing, can be enhanced)

lib/
  └── motion-primitives.tsx          (NEW - reusable motion components)

app/
  ├── page.tsx                       (UPDATED - new sections)
  ├── contact/page.tsx               (NEW)
  └── api/contact/route.ts           (NEW)

scripts/
  └── create-contact-table.ts        (NEW)
```
