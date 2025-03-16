
-- Create the system_logs table for advanced monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  category TEXT NOT NULL CHECK (category IN ('queue', 'order', 'driver', 'company', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster lookups by category and severity
CREATE INDEX IF NOT EXISTS system_logs_category_idx ON public.system_logs (category);
CREATE INDEX IF NOT EXISTS system_logs_severity_idx ON public.system_logs (severity);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at DESC);

-- Grant appropriate permissions
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
CREATE POLICY "Admins can view all logs" 
ON public.system_logs FOR SELECT 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Allow authenticated users to create logs
CREATE POLICY "Authenticated users can create logs" 
ON public.system_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);
