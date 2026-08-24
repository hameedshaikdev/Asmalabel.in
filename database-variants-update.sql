-- Add variants column to products table for rich size/color/combination support
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Example variant structure in variants column:
-- [
--   {
--     "id": "var_1700000001_a1b2",
--     "size": "11 Inch",
--     "color": "Red",
--     "color_value": "#D92F32",
--     "price": 499,
--     "original_price": 799,
--     "stock": 10,
--     "sku": "JUP-G275-11-R",
--     "images": ["https://...image1.jpg", "https://...image2.jpg"],
--     "is_default": true
--   }
-- ]
