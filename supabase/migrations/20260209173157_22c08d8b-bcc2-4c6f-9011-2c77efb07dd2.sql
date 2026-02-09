
-- Create outbound_leads table
CREATE TABLE public.outbound_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  google_place_id TEXT UNIQUE,
  business_type TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  campaign_status TEXT NOT NULL DEFAULT 'new',
  drip_step INTEGER NOT NULL DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  last_call_at TIMESTAMPTZ,
  call_outcome TEXT,
  call_transcript TEXT,
  call_recording_url TEXT,
  call_sid TEXT,
  converted_order_id UUID REFERENCES public.orders(id),
  discovery_batch TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view outbound leads"
  ON public.outbound_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert outbound leads"
  ON public.outbound_leads FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update outbound leads"
  ON public.outbound_leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete outbound leads"
  ON public.outbound_leads FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_outbound_leads_status ON public.outbound_leads(campaign_status);
CREATE INDEX idx_outbound_leads_zip ON public.outbound_leads(zip);
CREATE INDEX idx_outbound_leads_drip_step ON public.outbound_leads(drip_step);

CREATE TRIGGER update_outbound_leads_updated_at
  BEFORE UPDATE ON public.outbound_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create outbound_campaign_runs table
CREATE TABLE public.outbound_campaign_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  total_leads_found INTEGER DEFAULT 0,
  total_emails_sent INTEGER DEFAULT 0,
  total_calls_made INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_campaign_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaign runs"
  ON public.outbound_campaign_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_outbound_campaign_runs_updated_at
  BEFORE UPDATE ON public.outbound_campaign_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
