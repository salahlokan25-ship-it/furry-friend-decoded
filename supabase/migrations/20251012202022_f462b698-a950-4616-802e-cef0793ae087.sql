-- Create user_usage table to track daily limits
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  scan_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  scan_limit INTEGER DEFAULT 3,
  chat_limit INTEGER DEFAULT 3,
  unlimited BOOLEAN DEFAULT false,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage"
  ON public.user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get user limits
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
AS $$
BEGIN
  -- Reset counts if it's a new day
  UPDATE public.user_usage
  SET scan_count = 0,
      chat_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE user_id = user_id_param 
    AND last_reset_date < CURRENT_DATE;

  -- Insert default usage if user doesn't exist
  INSERT INTO public.user_usage (user_id)
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
  FROM public.user_usage u
  WHERE u.user_id = user_id_param;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  user_id_param UUID,
  usage_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  current_limit INTEGER;
  is_unlimited BOOLEAN;
BEGIN
  -- Ensure user record exists
  INSERT INTO public.user_usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  -- Reset if new day
  UPDATE public.user_usage
  SET scan_count = 0,
      chat_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE user_id = user_id_param 
    AND last_reset_date < CURRENT_DATE;

  -- Check if unlimited
  SELECT unlimited INTO is_unlimited
  FROM public.user_usage
  WHERE user_id = user_id_param;

  IF is_unlimited THEN
    RETURN TRUE;
  END IF;

  -- Get current count and limit based on type
  IF usage_type = 'scan' THEN
    SELECT scan_count, scan_limit INTO current_count, current_limit
    FROM public.user_usage
    WHERE user_id = user_id_param;
    
    IF current_count >= current_limit THEN
      RETURN FALSE;
    END IF;
    
    UPDATE public.user_usage
    SET scan_count = scan_count + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF usage_type = 'chat' THEN
    SELECT chat_count, chat_limit INTO current_count, current_limit
    FROM public.user_usage
    WHERE user_id = user_id_param;
    
    IF current_count >= current_limit THEN
      RETURN FALSE;
    END IF;
    
    UPDATE public.user_usage
    SET chat_count = chat_count + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
  END IF;

  RETURN TRUE;
END;
$$;