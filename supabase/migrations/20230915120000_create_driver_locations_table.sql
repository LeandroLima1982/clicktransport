
-- Create table for tracking driver locations
CREATE TABLE IF NOT EXISTS public.driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable row-level security
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Create policy for companies to view driver locations for their orders
CREATE POLICY "Companies can view driver locations for their orders" 
ON public.driver_locations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.service_orders so
    JOIN public.companies c ON c.id = so.company_id
    WHERE so.id = order_id AND c.user_id = auth.uid()
  )
);

-- Create policy for drivers to manage their own location
CREATE POLICY "Drivers can manage their own location" 
ON public.driver_locations
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.drivers d
    WHERE d.id = driver_id AND d.user_id = auth.uid()
  )
);

-- Create policy for reads
CREATE POLICY "Public read access to driver locations" 
ON public.driver_locations
FOR SELECT
USING (true);

-- Add real-time capabilities
ALTER TABLE public.driver_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Add index on order_id for faster lookups
CREATE INDEX idx_driver_locations_order_id ON public.driver_locations(order_id);

-- Add trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_driver_locations_timestamp
BEFORE UPDATE ON public.driver_locations
FOR EACH ROW
EXECUTE FUNCTION update_driver_location_timestamp();
