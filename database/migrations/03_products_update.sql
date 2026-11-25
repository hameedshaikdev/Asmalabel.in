-- Add multiple images and video links to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS images      TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_links JSONB   DEFAULT '[]';

-- images: array of image URLs
-- video_links: [{ title: "Installation Guide", url: "https://youtube.com/..." }]
