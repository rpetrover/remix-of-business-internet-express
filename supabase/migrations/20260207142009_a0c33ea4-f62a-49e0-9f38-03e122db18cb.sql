
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage order documents" ON storage.objects;

-- Replace with a more restrictive policy: only admin users can delete/update
CREATE POLICY "Admins can manage order documents"
ON storage.objects FOR ALL
USING (bucket_id = 'order-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (bucket_id = 'order-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));
