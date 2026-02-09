
-- Create table to track scanned newsroom articles so we don't re-process
CREATE TABLE IF NOT EXISTS public.spectrum_newsroom_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_url text NOT NULL UNIQUE,
  article_title text,
  publish_date text,
  locations_found jsonb DEFAULT '[]'::jsonb,
  zip_codes_extracted text[] DEFAULT '{}',
  scanned_at timestamptz NOT NULL DEFAULT now(),
  leads_discovered int DEFAULT 0
);

ALTER TABLE public.spectrum_newsroom_scans ENABLE ROW LEVEL SECURITY;

-- Admin-only access (has_role takes user_id first, then role)
CREATE POLICY "Admins can manage newsroom scans"
  ON public.spectrum_newsroom_scans
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
