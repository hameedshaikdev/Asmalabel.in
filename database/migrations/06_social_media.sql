-- Social Media Follower Counts Table
CREATE TABLE IF NOT EXISTS social_media_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE, -- 'instagram_tailoring', 'instagram_fashion', 'youtube', 'facebook'
  handle TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  platform_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default values
INSERT INTO social_media_stats (platform, handle, followers, description, platform_url) VALUES
('instagram_tailoring', '@as_tailoring_tools_textiles', 2500, 'Professional sewing machines, tailoring tools, daily tips & tutorials for craftsmen', 'https://www.instagram.com/as_tailoring_tools_textiles'),
('instagram_fashion', '@asma_label.in', 1800, 'Women''s fashion, ethnic wear collections, trending outfits & style inspiration', 'https://www.instagram.com/asma_label.in'),
('youtube', '@astailoringtoolstextiles', 5000, 'Sewing tutorials, machine reviews, tailoring tips & DIY fashion projects', 'https://youtube.com/@astailoringtoolstextiles'),
('facebook', 'AS HUB', 0, 'Send your fabrics to us and get magic created just for you - online tailoring store', 'https://www.facebook.com/share/166X2VepUx/?mibextid=wwXIfr')
ON CONFLICT (platform) DO NOTHING;

-- Enable RLS
ALTER TABLE social_media_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to social media stats"
  ON social_media_stats FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (admins) to update
CREATE POLICY "Allow admins to update social media stats"
  ON social_media_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
