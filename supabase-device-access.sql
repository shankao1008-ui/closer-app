-- Existing Closer schema only. Add own-profile access; never disable RLS.
begin;
alter table public.profiles enable row level security;
drop policy if exists "Closer device reads own profile" on public.profiles;
create policy "Closer device reads own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Closer device inserts own profile" on public.profiles;
create policy "Closer device inserts own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "Closer device updates own profile" on public.profiles;
create policy "Closer device updates own profile" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));
commit;
