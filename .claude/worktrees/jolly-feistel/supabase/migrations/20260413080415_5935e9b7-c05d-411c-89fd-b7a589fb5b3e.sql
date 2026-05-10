
-- Create enum for dealer application status
CREATE TYPE public.dealer_application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create dealer_applications table
CREATE TABLE public.dealer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  registration_number TEXT,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  status dealer_application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dealer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit own application"
ON public.dealer_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications"
ON public.dealer_applications FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
ON public.dealer_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
ON public.dealer_applications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_dealer_applications_updated_at
BEFORE UPDATE ON public.dealer_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
