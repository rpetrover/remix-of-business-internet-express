
-- Add ZIP confirmation tracking columns to outbound_leads
ALTER TABLE public.outbound_leads
  ADD COLUMN IF NOT EXISTS zip_raw_input text,
  ADD COLUMN IF NOT EXISTS zip_parsed text,
  ADD COLUMN IF NOT EXISTS zip_confirmed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS zip_retry_count integer DEFAULT 0;

-- Add address component tracking columns
ALTER TABLE public.outbound_leads
  ADD COLUMN IF NOT EXISTS address_street text,
  ADD COLUMN IF NOT EXISTS address_city_collected text,
  ADD COLUMN IF NOT EXISTS address_state_collected text,
  ADD COLUMN IF NOT EXISTS address_collection_step text DEFAULT 'not_started';
