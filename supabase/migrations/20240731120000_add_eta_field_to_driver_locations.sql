
-- Add the eta_seconds field to the driver_locations table
ALTER TABLE public.driver_locations 
ADD COLUMN IF NOT EXISTS eta_seconds DOUBLE PRECISION;

-- Add an index on the eta_seconds column for faster lookups
CREATE INDEX IF NOT EXISTS idx_driver_locations_eta ON public.driver_locations(eta_seconds);

-- Update the subscription information
COMMENT ON TABLE public.driver_locations IS 'Contains real-time driver location data with ETA';
