
-- Add capacity column to vehicle_rates table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_rates' 
    AND column_name = 'capacity'
  ) THEN
    ALTER TABLE public.vehicle_rates ADD COLUMN capacity integer DEFAULT 4 NOT NULL;
  END IF;
END
$$;

-- Add comments to the vehicle_rates table
COMMENT ON TABLE public.vehicle_rates IS 'Vehicle categories and pricing information';
COMMENT ON COLUMN public.vehicle_rates.capacity IS 'Maximum number of passengers for this vehicle type';
