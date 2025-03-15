
-- Queue management functions for robust handling of company assignment rotation

-- Function to get the next company in queue and update its position atomically
CREATE OR REPLACE FUNCTION public.get_next_company_in_queue()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_company_id UUID;
  result json;
BEGIN
  -- Lock the companies table to prevent race conditions
  LOCK TABLE public.companies IN SHARE ROW EXCLUSIVE MODE;
  
  -- Find the next company based on queue position and last assignment time
  SELECT id INTO selected_company_id
  FROM public.companies
  WHERE status = 'active'
  ORDER BY 
    -- First prioritize by queue position (non-null, non-zero values first)
    CASE 
      WHEN queue_position IS NULL OR queue_position = 0 THEN 2
      ELSE 1
    END,
    queue_position NULLS LAST,
    -- Then by last assignment time (oldest first)
    last_order_assigned NULLS FIRST
  LIMIT 1;
  
  -- If no company found, return null
  IF selected_company_id IS NULL THEN
    result := json_build_object('company_id', NULL, 'success', FALSE);
    RETURN result;
  END IF;
  
  -- Return the selected company ID
  result := json_build_object('company_id', selected_company_id, 'success', TRUE);
  RETURN result;
END;
$$;

-- Function to update a company's queue position atomically
CREATE OR REPLACE FUNCTION public.update_company_queue_position(company_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_position INTEGER;
  new_position INTEGER;
  result json;
BEGIN
  -- Lock the companies table to prevent race conditions
  LOCK TABLE public.companies IN SHARE ROW EXCLUSIVE MODE;
  
  -- Get the maximum queue position
  SELECT COALESCE(MAX(queue_position), 0) INTO max_position
  FROM public.companies
  WHERE queue_position IS NOT NULL;
  
  -- Set the new position to be one higher than the maximum
  new_position := max_position + 1;
  
  -- Update the company's queue position and last assignment time
  UPDATE public.companies
  SET 
    queue_position = new_position,
    last_order_assigned = NOW()
  WHERE id = company_id;
  
  -- Return success and the new position
  result := json_build_object('success', TRUE, 'new_position', new_position);
  RETURN result;
END;
$$;

-- Function to reset all company queue positions
CREATE OR REPLACE FUNCTION public.reset_company_queue_positions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_record RECORD;
  counter INTEGER := 0;
  result json;
BEGIN
  -- Lock the companies table to prevent race conditions
  LOCK TABLE public.companies IN SHARE ROW EXCLUSIVE MODE;
  
  -- Reset all active companies
  FOR company_record IN 
    SELECT id
    FROM public.companies
    WHERE status = 'active'
    ORDER BY name
  LOOP
    counter := counter + 1;
    
    UPDATE public.companies
    SET 
      queue_position = counter,
      -- Only the first company gets current timestamp, others get null
      last_order_assigned = CASE WHEN counter = 1 THEN NOW() ELSE NULL END
    WHERE id = company_record.id;
  END LOOP;
  
  -- Return success and count
  result := json_build_object('success', TRUE, 'companies_updated', counter);
  RETURN result;
END;
$$;

-- Function to fix invalid (null or 0) queue positions
CREATE OR REPLACE FUNCTION public.fix_invalid_queue_positions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_position INTEGER;
  company_record RECORD;
  fixed_count INTEGER := 0;
  next_position INTEGER;
  result json;
BEGIN
  -- Lock the companies table to prevent race conditions
  LOCK TABLE public.companies IN SHARE ROW EXCLUSIVE MODE;
  
  -- Get the maximum queue position
  SELECT COALESCE(MAX(queue_position), 0) INTO max_position
  FROM public.companies
  WHERE queue_position IS NOT NULL AND queue_position > 0;
  
  next_position := max_position + 1;
  
  -- Fix companies with null or 0 queue positions
  FOR company_record IN 
    SELECT id, name
    FROM public.companies
    WHERE (queue_position IS NULL OR queue_position = 0)
    AND status = 'active'
    ORDER BY name
  LOOP
    UPDATE public.companies
    SET queue_position = next_position
    WHERE id = company_record.id;
    
    fixed_count := fixed_count + 1;
    next_position := next_position + 1;
  END LOOP;
  
  -- Return success and count
  result := json_build_object('success', TRUE, 'fixed_count', fixed_count);
  RETURN result;
END;
$$;

-- Function to fix a single company's queue position
CREATE OR REPLACE FUNCTION public.fix_company_queue_position(company_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_position INTEGER;
  new_position INTEGER;
  result json;
BEGIN
  -- Lock the companies table to prevent race conditions
  LOCK TABLE public.companies IN SHARE ROW EXCLUSIVE MODE;
  
  -- Get the maximum queue position
  SELECT COALESCE(MAX(queue_position), 0) INTO max_position
  FROM public.companies
  WHERE queue_position IS NOT NULL AND queue_position > 0;
  
  -- Set the new position to be one higher than the maximum
  new_position := max_position + 1;
  
  -- Update the company's queue position
  UPDATE public.companies
  SET queue_position = new_position
  WHERE id = company_id;
  
  -- Return success and the new position
  result := json_build_object('success', TRUE, 'new_position', new_position);
  RETURN result;
END;
$$;

-- Add index on companies table to optimize queue queries
DO $$
BEGIN
  -- Check if index exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'companies' AND indexname = 'idx_companies_queue_factors'
  ) THEN
    CREATE INDEX idx_companies_queue_factors 
    ON public.companies (status, queue_position, last_order_assigned);
  END IF;
END $$;

-- Ensure queue_position is never negative
ALTER TABLE public.companies 
  ADD CONSTRAINT check_queue_position_positive 
  CHECK (queue_position IS NULL OR queue_position >= 0);

-- Add a function to validate the queue health
CREATE OR REPLACE FUNCTION public.check_queue_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invalid_count INTEGER;
  duplicate_count INTEGER;
  active_company_count INTEGER;
  result json;
BEGIN
  -- Count companies with null or 0 queue positions
  SELECT COUNT(*) INTO invalid_count
  FROM public.companies
  WHERE (queue_position IS NULL OR queue_position = 0)
  AND status = 'active';
  
  -- Count duplicate queue positions
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT queue_position, COUNT(*) as position_count
    FROM public.companies
    WHERE queue_position IS NOT NULL 
    AND queue_position > 0
    AND status = 'active'
    GROUP BY queue_position
    HAVING COUNT(*) > 1
  ) as dupes;
  
  -- Count total active companies
  SELECT COUNT(*) INTO active_company_count
  FROM public.companies
  WHERE status = 'active';
  
  -- Compile the health report
  result := json_build_object(
    'active_companies', active_company_count,
    'invalid_positions', invalid_count,
    'duplicate_positions', duplicate_count,
    'health_score', CASE 
      WHEN active_company_count = 0 THEN 0
      ELSE 100 - (100.0 * (invalid_count + duplicate_count) / active_company_count)
    END
  );
  
  RETURN result;
END;
$$;
