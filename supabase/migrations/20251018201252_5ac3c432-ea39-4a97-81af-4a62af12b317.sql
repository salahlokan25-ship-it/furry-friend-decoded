-- Fix critical RLS security vulnerabilities in trades table
-- Remove policies that allow unrestricted access to all trades

-- Drop the policy that allows any authenticated user to read ALL trades
DROP POLICY IF EXISTS "Users can read all trades" ON trades;

-- Drop the policy that allows any authenticated user to insert trades without user_id check
DROP POLICY IF EXISTS "Users can insert trades" ON trades;

-- Drop the policy that allows any authenticated user to update ANY trade
DROP POLICY IF EXISTS "Users can update their own trades" ON trades;

-- Drop the policy that allows any authenticated user to delete ANY trade
DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;

-- The following policies remain and provide proper security:
-- "Users can read own trades" - USING (auth.uid() = user_id)
-- "Users can insert own trades" - WITH CHECK (auth.uid() = user_id)
-- "Users can update own trades" - USING (auth.uid() = user_id)
-- "Users can delete own trades" - USING (auth.uid() = user_id)