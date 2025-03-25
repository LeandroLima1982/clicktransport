
-- Create a table for site logos (if it doesn't exist already)
CREATE TABLE IF NOT EXISTS site_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL, -- 'light' or 'dark'
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint to ensure only one logo per mode
ALTER TABLE site_logos DROP CONSTRAINT IF EXISTS site_logos_mode_key;
ALTER TABLE site_logos ADD CONSTRAINT site_logos_mode_key UNIQUE (mode);

-- Create RLS policies for site_logos table
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON site_logos;
CREATE POLICY "Allow full access for authenticated users" 
  ON site_logos
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Make sure the table is enabled for RLS
ALTER TABLE site_logos ENABLE ROW LEVEL SECURITY;

-- Add a trigger to update 'updated_at' field
CREATE OR REPLACE FUNCTION update_site_logos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_logos_updated_at ON site_logos;
CREATE TRIGGER update_site_logos_updated_at
BEFORE UPDATE ON site_logos
FOR EACH ROW
EXECUTE FUNCTION update_site_logos_updated_at();
