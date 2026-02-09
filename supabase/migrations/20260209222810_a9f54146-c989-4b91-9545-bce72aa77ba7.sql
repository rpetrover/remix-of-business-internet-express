
-- Add turn-taking and behavior metrics to call_records
ALTER TABLE public.call_records
  ADD COLUMN IF NOT EXISTS started_speaking_before_user boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS interruptions_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS no_input_reprompt_used boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_response_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_user_utterance_detected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS time_to_first_agent_speech_ms integer,
  ADD COLUMN IF NOT EXISTS time_to_first_user_speech_ms integer;
