-- Allow users to create/repair their own profile row (used by Profile page upsert).

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

grant insert on public.profiles to authenticated;
