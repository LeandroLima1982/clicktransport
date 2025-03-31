
-- Create a function to identify users with duplicate company records
CREATE OR REPLACE FUNCTION public.get_duplicate_companies()
RETURNS TABLE (user_id uuid, count bigint) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_id, COUNT(*) as count
  FROM public.companies
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1
$$;
