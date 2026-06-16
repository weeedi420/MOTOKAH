-- Content calendar for admin dashboard (Instagram / social posts + approval workflow).
create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  caption_sw text,
  platform text not null default 'instagram',
  post_type text not null default 'feed',
  pillar text,
  language text default 'en+sw',
  scheduled_date date,
  media_urls jsonb default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.content_posts enable row level security;

-- App-gated admin content (no PII), behind /admin isAdmin UI gate.
-- Demo admin runs as anon, so allow anon CRUD; production should tighten to admin role.
create policy "content read" on public.content_posts for select using (true);
create policy "content insert" on public.content_posts for insert with check (true);
create policy "content update" on public.content_posts for update using (true);
create policy "content delete" on public.content_posts for delete using (true);
