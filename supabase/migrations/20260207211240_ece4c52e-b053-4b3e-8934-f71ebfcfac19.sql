
-- =============================================
-- 1. Add attribution columns to abandoned_checkouts
-- =============================================
ALTER TABLE public.abandoned_checkouts
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS gbraid text,
  ADD COLUMN IF NOT EXISTS wbraid text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_adgroup text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS landing_page text;

-- =============================================
-- 2. Add attribution columns to orders
-- =============================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS gbraid text,
  ADD COLUMN IF NOT EXISTS wbraid text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_adgroup text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS landing_page text;

-- =============================================
-- 3. Create lead_status_history table
-- =============================================
CREATE TABLE public.lead_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  lead_type text NOT NULL DEFAULT 'abandoned_checkout',
  old_status text,
  new_status text NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  changed_by text DEFAULT 'system'
);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can read/manage history
CREATE POLICY "Admins can manage lead status history"
ON public.lead_status_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System/triggers can insert history
CREATE POLICY "System can insert status history"
ON public.lead_status_history
FOR INSERT
WITH CHECK (true);

-- Indexes for efficient querying
CREATE INDEX idx_lead_status_history_lead_id ON public.lead_status_history(lead_id);
CREATE INDEX idx_lead_status_history_changed_at ON public.lead_status_history(changed_at);
CREATE INDEX idx_lead_status_history_lead_type ON public.lead_status_history(lead_type);

-- =============================================
-- 4. Triggers to auto-log status changes
-- =============================================

-- Trigger function for abandoned_checkouts
CREATE OR REPLACE FUNCTION public.log_abandoned_checkout_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_status_history (lead_id, lead_type, old_status, new_status, changed_by)
    VALUES (NEW.id, 'abandoned_checkout', OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_log_abandoned_checkout_status
AFTER UPDATE ON public.abandoned_checkouts
FOR EACH ROW
EXECUTE FUNCTION public.log_abandoned_checkout_status_change();

-- Trigger function for orders
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_status_history (lead_id, lead_type, old_status, new_status, changed_by)
    VALUES (NEW.id, 'order', OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_log_order_status
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- =============================================
-- 5. Indexes on attribution columns for reporting
-- =============================================
CREATE INDEX idx_abandoned_checkouts_gclid ON public.abandoned_checkouts(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX idx_abandoned_checkouts_utm_source ON public.abandoned_checkouts(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_orders_gclid ON public.orders(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX idx_orders_utm_source ON public.orders(utm_source) WHERE utm_source IS NOT NULL;
