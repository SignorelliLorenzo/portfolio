# i18n Implementation Guide

## Overview
The portfolio now supports English (default) and Italian translations with:
- **Default EN** on existing routes (`/`, `/projects/[id]`)
- **Italian under `/it`** (`/it`, `/it/projects/[id]`)
- **Language switcher** in navbar (disabled when IT content missing)
- **DB-backed markdown** with git-versioned source files

---

## Architecture

### URL Structure
- English (default): `/`, `/projects/basket-ai`
- Italian: `/it`, `/it/projects/basket-ai`

### Content Sources
1. **Landing page UI strings**: `data/i18n/landing.en.json` / `landing.it.json`
2. **Project metadata**: DB columns (`short_description`, `short_description_it`)
3. **Project markdown**: DB columns (`markdown`, `markdown_it`) synced from git

---

## Database Schema

### Projects table columns (i18n)
```sql
short_description_it TEXT     -- Italian short description
markdown_it TEXT              -- Italian markdown content (full text)
features_it TEXT[]            -- Italian features array
```

### Migration
Run the seed script (already updated):
```bash
npm run seed
```

Or manually apply:
```bash
psql $DATABASE_URL < scripts/migrate-projects-i18n.sql
```

---

## Workflow: Adding/Updating Translations

### 1. Landing Page Translations
Edit JSON dictionaries:
- `data/i18n/landing.en.json`
- `data/i18n/landing.it.json`

Deploy automatically on next build.

### 2. Project Translations

#### Step 1: Create markdown files
Place versioned markdown in `content/projects/`:
```
content/projects/
  basket-ai.en.md
  basket-ai.it.md
  uda-sam-ss.en.md
  uda-sam-ss.it.md
```

#### Step 2: Sync to database
Run the sync script:
```bash
npm run sync-markdown
```

This uploads markdown content from files into DB columns.

#### Step 3: Update metadata (optional)
If you need to translate `short_description` or `features`, update DB directly:
```sql
UPDATE projects 
SET 
  short_description_it = 'Descrizione italiana...',
  features_it = ARRAY['Feature 1', 'Feature 2']
WHERE id = 'basket-ai';
```

Or add to a future seed/migration script.

---

## Language Switcher Behavior

The navbar language switcher:
- **Enabled** when `project.hasItalianTranslation === true`
- **Disabled** when no IT content exists for current page
- Preserves current route when switching (e.g., `/projects/x` ↔ `/it/projects/x`)

### How translation detection works
A project has Italian translation if **any** of these fields exist:
- `short_description_it`
- `markdown_it`
- `features_it`

---

## Fallback Strategy

When viewing `/it/projects/[id]`:
- If `markdown_it` is NULL → shows `markdown` (EN)
- If `short_description_it` is NULL → shows `short_description` (EN)
- If `features_it` is NULL → shows `features` (EN)
- `title` is always the same (no translation)

---

## Development Checklist

### Adding a new project with translations
1. Add project to `data/projects.json` (EN metadata)
2. Run `npm run seed` to create DB entry
3. Create `content/projects/<id>.en.md` and `<id>.it.md`
4. Run `npm run sync-markdown`
5. (Optional) Update `short_description_it` in DB if needed

### Testing translations
1. Visit `/` (English home)
2. Click language switcher → `/it` (Italian home)
3. Navigate to project → `/it/projects/[id]`
4. Verify:
   - Switcher is enabled if IT content exists
   - Switcher is disabled if IT content missing
   - Fallback to EN works when IT fields are NULL

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run seed` | Create/update projects table + add i18n columns |
| `npm run sync-markdown` | Upload markdown files from `content/projects/` to DB |

---

## Future Enhancements

- [ ] Add `/it/contact` page with translated form labels
- [ ] Localize navbar "About" link text
- [ ] Add `hreflang` meta tags for SEO
- [ ] Implement `generateMetadata` per locale
- [ ] Consider adding a language chooser page at `/`
