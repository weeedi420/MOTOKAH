-- Fix features locked by RLS-enabled-but-no-policy, and create the missing
-- listing-images storage bucket. Without these: profiles, wishlist, saved_searches,
-- conversations, messages all return zero rows, and car-ad / avatar image uploads fail.

-- ============ profiles ============
create policy "Public can read profiles"
  on public.profiles for select using (true);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ wishlist ============
create policy "Users read own wishlist"
  on public.wishlist for select using (auth.uid() = user_id);
create policy "Users insert own wishlist"
  on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users delete own wishlist"
  on public.wishlist for delete using (auth.uid() = user_id);

-- ============ saved_searches ============
create policy "Users read own saved searches"
  on public.saved_searches for select using (auth.uid() = user_id);
create policy "Users insert own saved searches"
  on public.saved_searches for insert with check (auth.uid() = user_id);
create policy "Users update own saved searches"
  on public.saved_searches for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own saved searches"
  on public.saved_searches for delete using (auth.uid() = user_id);

-- ============ conversations ============
create policy "Participants read conversations"
  on public.conversations for select
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);
create policy "Users start conversations"
  on public.conversations for insert
  with check (auth.uid() = participant1_id or auth.uid() = participant2_id);
create policy "Participants update conversations"
  on public.conversations for update
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

-- ============ messages ============
create policy "Participants read messages"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (auth.uid() = c.participant1_id or auth.uid() = c.participant2_id)
  ));
create policy "Participants send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.participant1_id or auth.uid() = c.participant2_id)
    )
  );
create policy "Participants update messages"
  on public.messages for update
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (auth.uid() = c.participant1_id or auth.uid() = c.participant2_id)
  ));

-- ============ storage: listing-images bucket ============
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public read listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');
create policy "Users upload own listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own listing images"
  on storage.objects for update
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
