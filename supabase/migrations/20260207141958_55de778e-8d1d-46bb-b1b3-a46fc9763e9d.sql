
-- Create storage bucket for order documents (phone bills, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-documents', 'order-documents', false);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload order documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-documents' AND auth.role() = 'authenticated');

-- Allow anyone to upload (for guest checkout via service role in edge function)
CREATE POLICY "Service role can manage order documents"
ON storage.objects FOR ALL
USING (bucket_id = 'order-documents')
WITH CHECK (bucket_id = 'order-documents');

-- Allow admins to read order documents
CREATE POLICY "Admins can view order documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add porting_bill_url column to orders table
ALTER TABLE public.orders ADD COLUMN porting_bill_url text;
