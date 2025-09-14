-- Fix security issue: Restrict service role policy to service_role only
DROP POLICY IF EXISTS "Service role can manage usage" ON public.user_usage;

-- Create a properly restricted policy for service role only
CREATE POLICY "Service role can manage usage" 
ON public.user_usage 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);