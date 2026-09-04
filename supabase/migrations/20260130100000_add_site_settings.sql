-- Create site_settings table for storing landing page configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read site settings (for landing page)
CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

-- Policy: Only admins can modify site settings
CREATE POLICY "Only admins can modify site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert default landing stats configuration
INSERT INTO site_settings (key, value)
VALUES (
  'landing_stats',
  '{
    "mode": "realtime",
    "hardcoded": {
      "alumni": 5000,
      "businesses": 200,
      "countries": 50,
      "years": 27
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
