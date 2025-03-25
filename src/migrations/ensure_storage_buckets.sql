
-- Ensure the site-images storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'Site Images', true)
ON CONFLICT (id) DO NOTHING;

-- Add a very permissive policy for the site-images bucket
CREATE POLICY "Allow public access to site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');
  
CREATE POLICY "Allow authenticated users to upload site-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');
  
CREATE POLICY "Allow authenticated users to update site-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
  
CREATE POLICY "Allow authenticated users to delete site-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
