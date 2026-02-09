
-- Add priority fiber launch tracking columns to outbound leads
ALTER TABLE public.outbound_leads 
  ADD COLUMN IF NOT EXISTS is_fiber_launch_area boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fiber_launch_source text;

-- Add index for quick filtering of priority leads
CREATE INDEX IF NOT EXISTS idx_outbound_leads_fiber_launch ON public.outbound_leads (is_fiber_launch_area) WHERE is_fiber_launch_area = true;
