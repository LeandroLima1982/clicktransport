
-- First add a manual_creation column to the companies table 
-- to indicate companies created directly through the UI
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS manual_creation BOOLEAN DEFAULT FALSE;

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
    INSERT INTO public.companies (name, user_id, status, queue_position, manual_creation)
    VALUES (
      COALESCE(NEW.full_name, 'Empresa ' || NEW.email), 
      NEW.id, 
      'pending',
      -- Get max queue position and add 1, or start at 1 if no companies exist
      COALESCE((SELECT MAX(queue_position) + 1 FROM public.companies WHERE status = 'active'), 1),
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$function$;
