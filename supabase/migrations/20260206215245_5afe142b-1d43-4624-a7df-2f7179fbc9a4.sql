
-- Create orders table to track all Intelisys order submissions
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer information
  customer_name TEXT NOT NULL,
  service_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Service details
  service_type TEXT NOT NULL DEFAULT 'Business internet service only',
  preferred_provider TEXT,
  selected_plan TEXT,
  speed TEXT,
  monthly_price NUMERIC,
  
  -- Order tracking
  status TEXT NOT NULL DEFAULT 'pending',
  channel TEXT NOT NULL DEFAULT 'chat',
  intelisys_email_sent BOOLEAN NOT NULL DEFAULT false,
  intelisys_sent_at TIMESTAMP WITH TIME ZONE,
  resend_id TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can manage orders"
ON public.orders
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
