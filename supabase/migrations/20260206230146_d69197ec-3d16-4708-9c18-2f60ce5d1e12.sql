
-- Drop the overly permissive update policy
DROP POLICY "Anyone can opt out" ON public.abandoned_checkouts;

-- Create a more restrictive policy that only allows updating opt-out fields
-- Uses a security definer function to safely restrict what can be updated
CREATE OR REPLACE FUNCTION public.handle_opt_out(checkout_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.abandoned_checkouts
  SET opted_out = true, opted_out_at = now(), updated_at = now()
  WHERE email = checkout_email AND opted_out = false;
END;
$$;
