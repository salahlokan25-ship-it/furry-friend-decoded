-- Fix security warnings by setting search_path on functions

-- Update get_user_limits function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_limits(user_id_param UUID)
RETURNS TABLE (
  scan_count INTEGER,
  chat_count INTEGER,
  scan_limit INTEGER,
  chat_limit INTEGER,
  unlimited BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset counts if it's a new day
  UPDATE user_usage
  SET scan_count = 0,
      chat_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE user_id = user_id_param 
    AND last_reset_date < CURRENT_DATE;

  -- Insert default usage if user doesn't exist
  INSERT INTO user_usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  -- Return current usage stats
  RETURN QUERY
  SELECT 
    u.scan_count,
    u.chat_count,
    u.scan_limit,
    u.chat_limit,
    u.unlimited
  FROM user_usage u
  WHERE u.user_id = user_id_param;
END;
$$;

-- Update increment_usage function with proper search_path
CREATE OR REPLACE FUNCTION public.increment_usage(
  user_id_param UUID,
  usage_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  current_limit INTEGER;
  is_unlimited BOOLEAN;
BEGIN
  -- Ensure user record exists
  INSERT INTO user_usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  -- Reset if new day
  UPDATE user_usage
  SET scan_count = 0,
      chat_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE user_id = user_id_param 
    AND last_reset_date < CURRENT_DATE;

  -- Check if unlimited
  SELECT unlimited INTO is_unlimited
  FROM user_usage
  WHERE user_id = user_id_param;

  IF is_unlimited THEN
    RETURN TRUE;
  END IF;

  -- Get current count and limit based on type
  IF usage_type = 'scan' THEN
    SELECT scan_count, scan_limit INTO current_count, current_limit
    FROM user_usage
    WHERE user_id = user_id_param;
    
    IF current_count >= current_limit THEN
      RETURN FALSE;
    END IF;
    
    UPDATE user_usage
    SET scan_count = scan_count + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF usage_type = 'chat' THEN
    SELECT chat_count, chat_limit INTO current_count, current_limit
    FROM user_usage
    WHERE user_id = user_id_param;
    
    IF current_count >= current_limit THEN
      RETURN FALSE;
    END IF;
    
    UPDATE user_usage
    SET chat_count = chat_count + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
  END IF;

  RETURN TRUE;
END;
$$;