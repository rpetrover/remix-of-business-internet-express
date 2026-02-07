
-- Create table for admin OTP codes
CREATE TABLE public.admin_otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- No public access — only service role can read/write
-- (edge functions use service role key)

-- Auto-cleanup: delete expired codes older than 1 hour
CREATE INDEX idx_admin_otp_email ON public.admin_otp_codes (email, used, expires_at);
