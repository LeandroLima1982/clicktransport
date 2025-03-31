
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

-- Create a function to fix duplicate companies
-- This function removes all but the oldest company record for each user
CREATE OR REPLACE FUNCTION public.fix_duplicate_companies()
RETURNS TABLE (fixed_user_id uuid, removed_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH duplicates AS (
    SELECT user_id
    FROM public.companies
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ),
  to_keep AS (
    SELECT DISTINCT ON (user_id) id
    FROM public.companies
    WHERE user_id IN (SELECT user_id FROM duplicates)
    ORDER BY user_id, created_at ASC
  ),
  deleted AS (
    DELETE FROM public.companies
    WHERE user_id IN (SELECT user_id FROM duplicates)
    AND id NOT IN (SELECT id FROM to_keep)
    RETURNING user_id
  )
  SELECT user_id, COUNT(*) as removed_count
  FROM deleted
  GROUP BY user_id
$$;
