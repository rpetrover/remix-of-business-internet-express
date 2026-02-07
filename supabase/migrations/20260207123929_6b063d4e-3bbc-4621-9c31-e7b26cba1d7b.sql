
-- Create table to track Intelisys information request threads
CREATE TABLE public.intelisys_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  intelisys_email_id UUID REFERENCES public.emails(id),
  request_type TEXT NOT NULL DEFAULT 'customer_info', -- 'customer_info' or 'dealer_info'
  request_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending_customer, pending_admin, reply_received, draft_ready, resolved
  customer_email TEXT,
  admin_email TEXT DEFAULT 'rich@scotchtowntechnology.com',
  outbound_email_id UUID REFERENCES public.emails(id),
  reply_email_id UUID REFERENCES public.emails(id),
  intelisys_reply_draft TEXT,
  intelisys_from_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intelisys_threads ENABLE ROW LEVEL SECURITY;

-- Only admins can manage threads
CREATE POLICY "Admins can manage intelisys threads"
ON public.intelisys_threads
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role needs access for edge functions (insert/update from webhook)
-- Edge functions use service role key, which bypasses RLS

-- Index for fast lookups
CREATE INDEX idx_intelisys_threads_status ON public.intelisys_threads(status);
CREATE INDEX idx_intelisys_threads_customer_email ON public.intelisys_threads(customer_email);
CREATE INDEX idx_intelisys_threads_order_id ON public.intelisys_threads(order_id);

-- Update trigger
CREATE TRIGGER update_intelisys_threads_updated_at
BEFORE UPDATE ON public.intelisys_threads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
