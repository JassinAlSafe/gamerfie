-- Create storage bucket for challenge covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenges', 'challenges', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload challenge covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'challenges' AND
  (storage.foldername(name))[1] = 'challenge-covers'
);

-- Allow public access to challenge covers
CREATE POLICY "Public access to challenge covers"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'challenges');

-- Allow users to delete their own challenge covers
CREATE POLICY "Users can delete their own challenge covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'challenges' AND
  (storage.foldername(name))[1] = 'challenge-covers' AND
  auth.uid() = owner
); 