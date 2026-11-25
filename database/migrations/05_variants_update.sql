-- ============================================================
-- AS HUB / Asma Label — Products Schema Update (Variants, Gallery Images & Video Links)
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Add variants, images, and video_links columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants    JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images      TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_links JSONB   DEFAULT '[]';

-- 2. Notify PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';

-- 3. Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('variants', 'images', 'video_links')
ORDER BY ordinal_position;

