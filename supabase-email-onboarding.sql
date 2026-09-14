-- Closer: passwordless email onboarding and private profile photos.
-- Run once in Supabase SQL Editor.

alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists onboarding_completed boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users read own or partner avatar" on storage.objects;
create policy "Users read own or partner avatar"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.shares_couple_with(((storage.foldername(name))[1])::uuid)
  )
);

-- Optional test reset. This deliberately removes existing test couples/messages,
-- while leaving Auth users intact so you can sign out before testing Magic Link.
-- Uncomment these lines only when you are ready:
-- delete from public.couples;

