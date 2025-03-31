
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

-- Function to format a CNPJ string
CREATE OR REPLACE FUNCTION public.format_cnpj_string(cnpj_raw text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits text;
BEGIN
  -- Remove non-digit characters
  digits := REGEXP_REPLACE(cnpj_raw, '[^0-9]', '', 'g');
  
  -- If the CNPJ has 14 digits, format it
  IF LENGTH(digits) = 14 THEN
    RETURN REGEXP_REPLACE(
      digits,
      '([0-9]{2})([0-9]{3})([0-9]{3})([0-9]{4})([0-9]{2})',
      '\1.\2.\3/\4-\5'
    );
  END IF;
  
  -- Otherwise return the original value
  RETURN cnpj_raw;
END;
$$;
