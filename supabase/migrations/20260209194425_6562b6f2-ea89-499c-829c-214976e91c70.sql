ALTER TABLE public.outbound_leads
  ADD COLUMN IF NOT EXISTS gatekeeper_encountered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS decision_maker_reached boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS decision_maker_name text,
  ADD COLUMN IF NOT EXISTS decision_maker_title text,
  ADD COLUMN IF NOT EXISTS callback_time text;