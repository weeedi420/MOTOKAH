-- Auto-email triggers for Motokah
-- 1. Welcome email on new user signup (profiles INSERT)
-- 2. Listing approval email when listing status changes to 'approved'

-- ============================================================
-- TRIGGER 1: Welcome email on signup
-- Fires when a new row is inserted into public.profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_name  TEXT;
  v_url   TEXT;
  v_key   TEXT;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
  IF v_email IS NULL THEN RETURN NEW; END IF;

  IF v_email ILIKE '%@motokah.com'
     OR v_email ILIKE '%1point%'
     OR v_email ILIKE '%+motokah%'
     OR v_email ILIKE '%appreview%'
  THEN RETURN NEW; END IF;

  v_name := COALESCE(NULLIF(NEW.display_name, ''), 'there');
  v_url  := 'https://dimywnbmmliluounwqfb.supabase.co/functions/v1/send-email';
  v_key  := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbXl3bmJtbWxpbHVvdW53cWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1NjgwOSwiZXhwIjoyMDk4NjMyODA5fQ.X9gtde5t3F7TNEL9MJ2pvRWFDfDXiOg7MAi4VN7lzPM';

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'to_email', v_email,
      'to_name',  v_name,
      'subject',  'Welcome to Motokah',
      'html',     '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;color:#1a1a2e;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;"><tr><td style="background:#014dc5;padding:32px 40px 28px;"><div style="font-family:Arial Black,Arial,sans-serif;font-size:22px;font-weight:900;color:#ffffff;">Motokah.</div><div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">East Africa''s Vehicle Marketplace</div></td></tr><tr><td style="background:#e8effc;padding:32px 40px 24px;border-bottom:1px solid #e5e7eb;"><div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#014dc5;margin-bottom:8px;">Welcome to Motokah</div><div style="font-family:Arial Black,Arial,sans-serif;font-size:26px;font-weight:900;color:#1a1a2e;line-height:1.2;">You''re in, ' || v_name || '.</div></td></tr><tr><td style="padding:32px 40px;"><p style="font-size:15px;color:#1a1a2e;line-height:1.65;margin:0 0 20px;">Hi ' || v_name || ',</p><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">Welcome to Motokah &mdash; East Africa''s vehicle marketplace. You can now post listings, browse thousands of vehicles, and connect directly with buyers and sellers across Tanzania, Kenya, Uganda, and Ethiopia.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center"><a href="https://motokah.com/sell" style="display:inline-block;background:#014dc5;color:#ffffff;font-family:Arial Black,Arial,sans-serif;font-weight:900;font-size:14px;padding:13px 36px;border-radius:8px;text-decoration:none;">Post Your First Listing</a></td></tr></table><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">It''s free to list. Once you post a vehicle, our team will review it and approve it within 24 hours.</p><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">If you need help, WhatsApp our support team on <strong style="color:#1a1a2e;">+255 797 666 777</strong>.</p><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0;">Welcome aboard.<br><strong style="color:#1a1a2e;">The Motokah Team</strong></p></td></tr><tr><td style="border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;"><div style="font-family:Arial Black,Arial,sans-serif;font-weight:900;color:#014dc5;font-size:12px;margin-bottom:6px;">Motokah</div><p style="font-size:11px;color:#6b7280;line-height:1.6;margin:0;">East Africa''s Vehicle Marketplace &nbsp;&middot;&nbsp; motokah.com<br><br>You''re receiving this because you created an account on Motokah.</p></td></tr></table></td></tr></table></body></html>'
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup if email fails
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();


-- ============================================================
-- TRIGGER 2: Listing approval email when status → 'approved'
-- Fires on UPDATE to public.listings
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_listing_approved_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email     TEXT;
  v_name      TEXT;
  v_price_fmt TEXT;
  v_url       TEXT;
  v_key       TEXT;
  v_listing_url TEXT;
BEGIN
  -- Only fire when status flips to 'approved'
  IF OLD.status = NEW.status OR NEW.status <> 'approved' THEN RETURN NEW; END IF;

  -- Get seller email
  SELECT au.email, COALESCE(NULLIF(p.display_name, ''), 'there')
    INTO v_email, v_name
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE au.id = NEW.seller_id;

  IF v_email IS NULL THEN RETURN NEW; END IF;

  -- Skip team accounts
  IF v_email ILIKE '%@motokah.com'
     OR v_email ILIKE '%1point%'
     OR v_email ILIKE '%+motokah%'
     OR v_email ILIKE '%appreview%'
  THEN RETURN NEW; END IF;

  v_price_fmt := NEW.currency || ' ' || TO_CHAR(NEW.price::numeric, 'FM999,999,999,999');
  v_url       := 'https://dimywnbmmliluounwqfb.supabase.co/functions/v1/send-email';
  v_key       := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbXl3bmJtbWxpbHVvdW53cWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA1NjgwOSwiZXhwIjoyMDk4NjMyODA5fQ.X9gtde5t3F7TNEL9MJ2pvRWFDfDXiOg7MAi4VN7lzPM';

  -- Build slug for listing URL
  v_listing_url := 'https://motokah.com/listing/' ||
    regexp_replace(
      lower(
        COALESCE(NEW.year::text, '') || '-' ||
        COALESCE(NEW.make, '') || '-' ||
        COALESCE(NEW.model, '') || '-' ||
        COALESCE(split_part(NEW.city, ',', 1), '')
      ),
      '[^a-z0-9]+', '-', 'g'
    ) || '-' || NEW.id;

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'to_email', v_email,
      'to_name',  v_name,
      'subject',  'Your listing is live on Motokah',
      'html', '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;color:#1a1a2e;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;"><tr><td style="background:#014dc5;padding:32px 40px 28px;"><div style="font-family:Arial Black,Arial,sans-serif;font-size:22px;font-weight:900;color:#ffffff;">Motokah.</div><div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">East Africa''s Vehicle Marketplace</div></td></tr><tr><td style="background:#e8effc;padding:32px 40px 24px;border-bottom:1px solid #e5e7eb;"><div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#014dc5;margin-bottom:8px;">Listing Approved</div><div style="font-family:Arial Black,Arial,sans-serif;font-size:26px;font-weight:900;color:#1a1a2e;line-height:1.2;">Your listing is live, ' || v_name || '.</div></td></tr><tr><td style="padding:32px 40px;"><p style="font-size:15px;color:#1a1a2e;line-height:1.65;margin:0 0 20px;">Hi ' || v_name || ',</p><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">Your listing has been reviewed and approved. Buyers across East Africa can now find your vehicle.</p><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:28px;"><tr><td style="background:#e6f7ee;padding:10px 16px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#28af60;"></span>&nbsp;<span style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#28af60;">Approved &amp; Live</span></td></tr><tr><td style="padding:16px;"><div style="font-family:Arial Black,Arial,sans-serif;font-size:17px;font-weight:900;color:#1a1a2e;margin-bottom:6px;">' || COALESCE(NEW.year::text,'') || ' ' || COALESCE(NEW.make,'') || ' ' || COALESCE(NEW.model,'') || '</div><div style="font-size:13px;color:#6b7280;">' || COALESCE(split_part(NEW.city,'',1), NEW.city, '') || ' &nbsp;&bull;&nbsp; ' || COALESCE(NEW.condition,'Used') || '</div><div style="font-family:Arial Black,Arial,sans-serif;font-size:20px;font-weight:900;color:#014dc5;margin-top:12px;">' || v_price_fmt || '</div></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center"><a href="' || v_listing_url || '" style="display:inline-block;background:#014dc5;color:#ffffff;font-family:Arial Black,Arial,sans-serif;font-weight:900;font-size:14px;padding:13px 36px;border-radius:8px;text-decoration:none;">View Your Listing</a></td></tr></table><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">If you need help, WhatsApp our support team on <strong style="color:#1a1a2e;">+255 797 666 777</strong>.</p><p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0;">Good luck with the sale.<br><strong style="color:#1a1a2e;">The Motokah Team</strong></p></td></tr><tr><td style="border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;"><div style="font-family:Arial Black,Arial,sans-serif;font-weight:900;color:#014dc5;font-size:12px;margin-bottom:6px;">Motokah</div><p style="font-size:11px;color:#6b7280;line-height:1.6;margin:0;">motokah.com &nbsp;&middot;&nbsp; Tanzania &middot; Kenya &middot; Uganda &middot; Ethiopia<br><br>You''re receiving this because you have a listing on Motokah.</p></td></tr></table></td></tr></table></body></html>'
    )::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_listing_approved_send_email ON public.listings;
CREATE TRIGGER on_listing_approved_send_email
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_listing_approved_email();
