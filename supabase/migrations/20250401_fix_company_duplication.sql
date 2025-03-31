
-- First add a manual_creation column to the companies table 
-- to indicate companies created directly through the UI
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS manual_creation BOOLEAN DEFAULT FALSE;

-- Add column for formatted CNPJ if it doesn't exist already
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS formatted_cnpj TEXT;

-- Update the ensure_company_record function to check for manual_creation
-- This will prevent duplicate company creation
CREATE OR REPLACE FUNCTION public.ensure_company_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only create a company record if:
  -- 1. The user has a 'company' role
  -- 2. No company record already exists for this user (this prevents duplicates)
  -- 3. This is a new user or the role has changed to 'company'
  IF NEW.role = 'company' AND NOT EXISTS (
    SELECT 1 FROM public.companies WHERE user_id = NEW.id
  ) THEN
    -- Create a default company record with a proper queue position
    INSERT INTO public.companies (name, user_id, status, queue_position, manual_creation, cnpj)
    VALUES (
      COALESCE(NEW.full_name, 'Empresa ' || NEW.email), 
      NEW.id, 
      'pending',
      -- Get max queue position and add 1, or start at 1 if no companies exist
      COALESCE((SELECT MAX(queue_position) + 1 FROM public.companies WHERE status = 'active'), 1),
      FALSE,
      COALESCE(NEW.cnpj, NULL)
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create a function to format CNPJ upon insert or update
CREATE OR REPLACE FUNCTION public.format_cnpj()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- If CNPJ exists, format it
  IF NEW.cnpj IS NOT NULL AND LENGTH(REGEXP_REPLACE(NEW.cnpj, '[^0-9]', '', 'g')) = 14 THEN
    NEW.formatted_cnpj := REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.cnpj, '[^0-9]', '', 'g'),
      '([0-9]{2})([0-9]{3})([0-9]{3})([0-9]{4})([0-9]{2})',
      '\1.\2.\3/\4-\5'
    );
  ELSE
    NEW.formatted_cnpj := NEW.cnpj;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to format CNPJ on insert or update
DROP TRIGGER IF EXISTS format_cnpj_trigger ON public.companies;
CREATE TRIGGER format_cnpj_trigger
BEFORE INSERT OR UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.format_cnpj();
