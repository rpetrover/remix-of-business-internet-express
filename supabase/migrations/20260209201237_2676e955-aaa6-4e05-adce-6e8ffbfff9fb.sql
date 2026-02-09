
-- Create a public storage bucket for reports
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: admins can read reports
CREATE POLICY "Admins can read reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports' AND public.has_role(auth.uid(), 'admin'));

-- RLS: service role inserts (edge functions use service role so no policy needed for insert,
-- but let's allow admin insert too)
CREATE POLICY "Admins can manage reports"
ON storage.objects FOR ALL
USING (bucket_id = 'reports' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'reports' AND public.has_role(auth.uid(), 'admin'));
