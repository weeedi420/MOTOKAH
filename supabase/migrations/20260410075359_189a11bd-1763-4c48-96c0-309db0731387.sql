
-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));

-- RPC to increment listing views
CREATE OR REPLACE FUNCTION public.increment_listing_views(_listing_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.listings SET views = views + 1 WHERE id = _listing_id;
$$;
