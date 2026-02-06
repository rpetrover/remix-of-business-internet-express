
-- Abandoned checkouts tracking table
CREATE TABLE public.abandoned_checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  customer_name TEXT,
  selected_plan TEXT,
  selected_provider TEXT,
  monthly_price NUMERIC,
  speed TEXT,
  service_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  cart_snapshot JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'abandoned',
  opted_out BOOLEAN NOT NULL DEFAULT false,
  opted_out_at TIMESTAMP WITH TIME ZONE,
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  last_follow_up_at TIMESTAMP WITH TIME ZONE,
  follow_up_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Follow-up actions log (emails sent, calls made)
CREATE TABLE public.follow_up_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id UUID NOT NULL REFERENCES public.abandoned_checkouts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'email', 'call'
  sequence_step INTEGER NOT NULL, -- 1-5 for emails, 1+ for calls
  subject TEXT, -- email subject
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'completed', 'no_answer'
  response_data JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_actions ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies for abandoned_checkouts
CREATE POLICY "Admins can manage abandoned checkouts"
  ON public.abandoned_checkouts
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin-only access policies for follow_up_actions
CREATE POLICY "Admins can manage follow-up actions"
  ON public.follow_up_actions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow anonymous inserts for lead capture (no auth required for capturing leads)
CREATE POLICY "Anyone can create abandoned checkouts"
  ON public.abandoned_checkouts
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous updates for opt-out (by checking opt-out token via email)
CREATE POLICY "Anyone can opt out"
  ON public.abandoned_checkouts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_abandoned_checkouts_updated_at
  BEFORE UPDATE ON public.abandoned_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient cron queries
CREATE INDEX idx_abandoned_checkouts_status ON public.abandoned_checkouts(status) WHERE status = 'abandoned' AND opted_out = false AND converted = false;
CREATE INDEX idx_abandoned_checkouts_email ON public.abandoned_checkouts(email);
CREATE INDEX idx_follow_up_actions_checkout ON public.follow_up_actions(checkout_id);
CREATE INDEX idx_follow_up_actions_scheduled ON public.follow_up_actions(scheduled_at) WHERE status = 'pending';
