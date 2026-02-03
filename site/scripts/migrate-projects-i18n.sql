-- Migration script to add Italian localization columns to projects table
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Add Italian short description
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS short_description_it TEXT;

-- Add Italian markdown content
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS markdown_it TEXT;

-- Add Italian features array
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS features_it TEXT[];

-- Optional: Add index for faster queries if needed
-- CREATE INDEX IF NOT EXISTS idx_projects_has_italian ON projects(short_description_it, markdown_it);
