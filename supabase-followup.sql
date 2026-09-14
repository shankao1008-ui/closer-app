-- Run once after the initial Closer schema.
alter table public.profiles add column if not exists city_data jsonb;

create or replace function public.shares_couple_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members mine
    join public.couple_members theirs on theirs.couple_id = mine.couple_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target_user
  );
$$;

revoke all on function public.shares_couple_with(uuid) from public;
grant execute on function public.shares_couple_with(uuid) to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users read own or partner profile" on public.profiles;
create policy "Users read own or partner profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.shares_couple_with(id));

-- Enable live updates used by pairing, chat, profiles, relationship dates and widget photos.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'couple_members', 'messages', 'profiles', 'relationship_settings', 'widget_photos'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
