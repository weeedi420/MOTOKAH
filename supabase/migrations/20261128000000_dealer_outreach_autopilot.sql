-- Dealer outreach autopilot: who to email, where each dealer is in the sequence, and the
-- on/off switch. The dealer-outreach-tick edge function reads these; pg_cron calls it every
-- 20 minutes. Nothing is sent while outreach_settings.enabled is false.

create table if not exists public.dealer_outreach_contacts (
  email text primary key,
  dealer_name text,
  city text,
  country text,
  website text,
  step int not null default 0,            -- emails sent so far (0 = not contacted)
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'replied', 'unsubscribed', 'bounced', 'done', 'signed_up', 'failed')),
  variant text,                           -- first-email template, kept for the follow-up and A/B results
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.dealer_outreach_contacts enable row level security; -- service role only

create table if not exists public.outreach_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  daily_cap int not null default 6,
  followup_days int not null default 5,
  window_start_hour int not null default 9,   -- local time, Africa/Dar_es_Salaam (UTC+3)
  window_end_hour int not null default 17,
  send_days int[] not null default '{1,2,3,4,5,6}', -- ISO weekday, Mon=1
  stat_clicks int,
  stat_impressions int,
  stat_period text,
  updated_at timestamptz not null default now()
);
alter table public.outreach_settings enable row level security;
insert into public.outreach_settings (id) values (1) on conflict (id) do nothing;

alter table public.dealer_email_log add column if not exists step int;
alter table public.dealer_email_log drop constraint if exists dealer_email_log_status_check;
alter table public.dealer_email_log add constraint dealer_email_log_status_check
  check (status in ('sent', 'failed', 'skipped_suppressed', 'skipped_no_email'));

alter table public.outreach_settings
  add column if not exists stat_month_clicks int,
  add column if not exists stat_month_label text;
