
-- Function to validate if a driver is associated with a company
CREATE OR REPLACE FUNCTION public.validate_driver_company_association(_email TEXT, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  driver_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.drivers
    WHERE email = _email 
    AND company_id = _company_id
    AND status = 'active'
  ) INTO driver_exists;
  
  RETURN driver_exists;
END;
$$;
