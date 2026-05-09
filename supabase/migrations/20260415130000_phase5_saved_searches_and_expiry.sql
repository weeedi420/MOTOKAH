-- ============================================================
-- PHASE 5: Saved searches + listing expiry
-- ============================================================

-- ── 1. saved_searches table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_saved_searches_user
  ON public.saved_searches(user_id);

-- Users can only manage their own saved searches
CREATE POLICY "Users manage own saved searches"
  ON public.saved_searches
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. listings: add expires_at column ────────────────────
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Back-fill existing listings: expire 60 days from created_at
UPDATE public.listings
  SET expires_at = created_at + INTERVAL '60 days'
  WHERE expires_at IS NULL;

-- New listings automatically expire 60 days after creation
CREATE OR REPLACE FUNCTION public.set_listing_expiry()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '60 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listing_expiry ON public.listings;
CREATE TRIGGER trg_listing_expiry
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_listing_expiry();
