
-- Create call_records table for storing call recordings, transcripts, and summaries
CREATE TABLE public.call_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  direction TEXT NOT NULL DEFAULT 'outbound',
  caller_phone TEXT,
  callee_phone TEXT,
  customer_name TEXT,
  customer_email TEXT,
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  call_sid TEXT,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  related_checkout_id UUID REFERENCES public.abandoned_checkouts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage call records"
  ON public.call_records
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role inserts (from edge functions)
CREATE POLICY "Service can insert call records"
  ON public.call_records
  FOR INSERT
  WITH CHECK (true);

-- Timestamp trigger
CREATE TRIGGER update_call_records_updated_at
  BEFORE UPDATE ON public.call_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for lookups
CREATE INDEX idx_call_records_checkout ON public.call_records(related_checkout_id);
CREATE INDEX idx_call_records_order ON public.call_records(related_order_id);
CREATE INDEX idx_call_records_created ON public.call_records(created_at DESC);
