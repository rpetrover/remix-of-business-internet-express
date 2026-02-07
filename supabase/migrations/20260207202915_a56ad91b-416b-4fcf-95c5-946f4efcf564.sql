-- Allow unauthenticated (anon) users to upload porting bills during checkout
-- Restricted to the porting-bills/ folder only for security
CREATE POLICY "Anyone can upload porting bills"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'order-documents'
  AND (storage.foldername(name))[1] = 'porting-bills'
);