-- ============================================================
-- PHASE 1: Schema fixes, missing columns, FK constraints,
--           and performance indexes
-- ============================================================

-- ── 1. reports: add missing `resolved` column ──────────────
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS resolved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- ── 2. reports: add missing FK constraints ─────────────────
-- reporter_id → auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reports_reporter_id_fkey'
      AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_reporter_id_fkey
      FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- listing_id → listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reports_listing_id_fkey'
      AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_listing_id_fkey
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 3. blog_posts: add missing author_id FK ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_author_id_fkey'
      AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── 4. dealer_applications: add explicit FK ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'dealer_applications_user_id_fkey'
      AND table_name = 'dealer_applications'
  ) THEN
    ALTER TABLE public.dealer_applications
      ADD CONSTRAINT dealer_applications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 5. Performance indexes ─────────────────────────────────

-- conversations: fast participant lookup
CREATE INDEX IF NOT EXISTS idx_conversations_participant1
  ON public.conversations(participant1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant2
  ON public.conversations(participant2_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON public.conversations(last_message_at DESC NULLS LAST);

-- messages: fast sender lookup + unread queries
CREATE INDEX IF NOT EXISTS idx_messages_sender
  ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_read
  ON public.messages(conversation_id, read)
  WHERE read = false;

-- reviews: fast seller/reviewer lookup
CREATE INDEX IF NOT EXISTS idx_reviews_seller
  ON public.reviews(seller_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer
  ON public.reviews(reviewer_id);

-- reports: fast unresolved lookup
CREATE INDEX IF NOT EXISTS idx_reports_unresolved
  ON public.reports(resolved)
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_reports_listing
  ON public.reports(listing_id);

-- notifications: fast unread lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, read)
  WHERE read = false;

-- listings: fast created_at ordering (already has status + make indexes)
CREATE INDEX IF NOT EXISTS idx_listings_created_at
  ON public.listings(created_at DESC);

-- ── 6. RLS policy for resolved column on reports ───────────
-- Allow admins to update the resolved field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reports' AND policyname = 'Admins can resolve reports'
  ) THEN
    CREATE POLICY "Admins can resolve reports"
    ON public.reports FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
