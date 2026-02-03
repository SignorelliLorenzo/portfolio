# Publishing Guide: Add Projects Without Redeploy

## Overview
You can now publish new projects (markdown + images) **without redeploying** the site. Content is stored in the database and served dynamically.

---

## One-Time Setup

### 1. Create the assets table
```bash
npm run setup:assets
```

This creates the `project_assets` table in your Neon database.

---

## Publishing a New Project

### Step 1: Prepare Your Content

Create the following structure:
```
content/
  projects/
    <project-id>.en.md          # English markdown
    <project-id>.it.md          # Italian markdown (optional)
    <project-id>.meta.json      # Metadata (optional)
  project-assets/
    <project-id>/
      image1.png                # Shared image
      diagram.en.png            # English-specific image
      diagram.it.png            # Italian-specific image
```

### Step 2: Create Metadata File (Optional)

`content/projects/<project-id>.meta.json`:
```json
{
  "shortDescriptionIt": "Descrizione breve in italiano",
  "featuresIt": [
    "Caratteristica 1",
    "Caratteristica 2"
  ]
}
```

### Step 3: Reference Images in Markdown

In your markdown files, reference images like:
```md
![Pipeline Diagram](/api/assets/basket-ai/pipeline.png)

# For locale-specific images:
![Italian Diagram](/api/assets/basket-ai/diagram.png?locale=it)
```

**Image naming conventions**:
- `image.png` → shared across locales
- `image.en.png` → English-specific (slug becomes `image.png`)
- `image.it.png` → Italian-specific (slug becomes `image.png`)

### Step 4: Ensure Project Exists in DB

The project must already exist in the database. If it's a brand new project:

**Option A**: Add to `data/projects.json` and run `npm run seed`

**Option B**: Insert directly into DB:
```sql
INSERT INTO projects (id, title, short_description, image, tags, featured)
VALUES (
  'my-project',
  'My Project Title',
  'Short description',
  '/images/placeholder.png',
  ARRAY['Tag1', 'Tag2'],
  true
);
```

### Step 5: Publish

```bash
npm run publish <project-id>
```

Example:
```bash
npm run publish basket-ai
```

This will:
1. ✅ Upload English markdown to `projects.markdown`
2. ✅ Upload Italian markdown to `projects.markdown_it` (if exists)
3. ✅ Update `short_description_it` and `features_it` (if in meta.json)
4. ✅ Upload all images from `content/project-assets/<project-id>/` to DB
5. ✅ Make content immediately available (no redeploy needed)

---

## How It Works

### Dynamic Content Serving
- Pages use `export const dynamic = "force-dynamic"` to bypass static caching
- New projects appear immediately after publishing
- No build/deploy required

### Image Storage
- Images stored as `bytea` in `project_assets` table
- Served via `/api/assets/[projectId]/[slug]` route
- Cached with `max-age=31536000` (1 year) for performance
- Locale-specific images supported via `?locale=it` query param

### Markdown Storage
- Stored as full text in DB columns (`markdown`, `markdown_it`)
- Rendered server-side with `ReactMarkdown`
- Supports HTML via `rehypeRaw` plugin

---

## Example: Publishing "Basket AI"

### 1. Create content structure
```
content/
  projects/
    basket-ai.en.md
    basket-ai.it.md
    basket-ai.meta.json
  project-assets/
    basket-ai/
      pipeline.png
      yolo-detection.png
      tracking-demo.gif
```

### 2. In markdown, reference images
```md
# Basket AI

![System Pipeline](/api/assets/basket-ai/pipeline.png)

## Detection
![YOLO Detection](/api/assets/basket-ai/yolo-detection.png)
```

### 3. Publish
```bash
npm run publish basket-ai
```

### 4. Verify
Visit:
- `https://yoursite.com/projects/basket-ai` (English)
- `https://yoursite.com/it/projects/basket-ai` (Italian)

Images load from `/api/assets/basket-ai/...`

---

## Updating Existing Projects

Just run the publish command again:
```bash
npm run publish basket-ai
```

It will:
- Overwrite markdown content
- Replace all assets (old assets with same slug are deleted first)
- Update metadata

---

## Troubleshooting

### "Project not found in DB"
Run `npm run seed` or manually insert the project into the database first.

### Images not loading
- Check the image path in markdown matches the filename in `project-assets/`
- Verify the asset was uploaded (check DB: `select * from project_assets where project_id = 'your-id'`)
- Check browser console for 404s

### Italian content not showing
- Ensure `<project-id>.it.md` exists
- Check `hasItalianTranslation` flag is true (set automatically if any IT content exists)
- Verify language switcher is enabled

### Changes not appearing
- Pages are dynamic, so changes should appear immediately
- Try hard refresh (Ctrl+Shift+R)
- Check if `export const dynamic = "force-dynamic"` is present in the page

---

## Performance Notes

### Image Size Recommendations
- Keep images under 2MB each for reasonable DB performance
- Use WebP format for better compression
- Consider image optimization before upload

### Database Considerations
- Images stored as `bytea` in Neon DB
- Suitable for moderate image counts (dozens per project)
- For hundreds of images, consider migrating to object storage (R2/S3)

### Caching
- Images cached for 1 year (`Cache-Control: public, max-age=31536000`)
- Vercel Edge Cache will cache responses globally
- Change image filename to bust cache if needed

---

## Future Enhancements

Potential improvements:
- [ ] Image optimization during upload (resize, compress)
- [ ] Admin web UI instead of CLI
- [ ] Bulk publish multiple projects
- [ ] Asset versioning/history
- [ ] Migration to object storage (R2) for better scalability
- [ ] Image CDN integration

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run setup:assets` | Create assets table (one-time) |
| `npm run publish <id>` | Publish/update a project |
| `npm run seed` | Seed projects from JSON |

| Path | Purpose |
|------|---------|
| `content/projects/<id>.en.md` | English markdown |
| `content/projects/<id>.it.md` | Italian markdown |
| `content/projects/<id>.meta.json` | Metadata |
| `content/project-assets/<id>/` | Project images |
| `/api/assets/<id>/<slug>` | Image serving endpoint |
