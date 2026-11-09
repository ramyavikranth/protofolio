-- Folio schema: documents, shares, profiles, RLS, and share-by-email RPC

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled document',
  content_json jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  shared_with_user_id uuid not null references public.profiles (id) on delete cascade,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now(),
  unique (document_id, shared_with_user_id)
);

create index if not exists documents_owner_id_idx on public.documents (owner_id);
create index if not exists document_shares_user_idx on public.document_shares (shared_with_user_id);
create index if not exists document_shares_document_idx on public.document_shares (document_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_documents_updated_at();

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Owner checks use owner_id = auth.uid() directly on documents.
-- Share checks use SECURITY DEFINER helpers that only read the other table
-- so documents <-> shares policies do not recurse.
create or replace function public.has_document_share(
  p_document_id uuid,
  p_require_edit boolean default false
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.document_shares s
    where s.document_id = p_document_id
      and s.shared_with_user_id = auth.uid()
      and (
        not p_require_edit
        or s.permission = 'edit'
      )
  );
$$;

create or replace function public.is_document_owner(p_document_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.documents d
    where d.id = p_document_id
      and d.owner_id = auth.uid()
  );
$$;

drop policy if exists "documents_select_own_or_shared" on public.documents;
create policy "documents_select_own_or_shared"
  on public.documents for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.has_document_share(id, false)
  );

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "documents_update_own_or_edit_share" on public.documents;
create policy "documents_update_own_or_edit_share"
  on public.documents for update
  to authenticated
  using (
    owner_id = auth.uid()
    or public.has_document_share(id, true)
  )
  with check (
    owner_id = auth.uid()
    or public.has_document_share(id, true)
  );

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
  on public.documents for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "shares_select_related" on public.document_shares;
create policy "shares_select_related"
  on public.document_shares for select
  to authenticated
  using (
    shared_with_user_id = auth.uid()
    or public.is_document_owner(document_id)
  );

drop policy if exists "shares_insert_owner" on public.document_shares;
create policy "shares_insert_owner"
  on public.document_shares for insert
  to authenticated
  with check (public.is_document_owner(document_id));

drop policy if exists "shares_delete_owner" on public.document_shares;
create policy "shares_delete_owner"
  on public.document_shares for delete
  to authenticated
  using (public.is_document_owner(document_id));

create or replace function public.share_document_by_email(
  p_document_id uuid,
  p_email text,
  p_permission text default 'view'
)
returns public.document_shares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_target uuid;
  v_share public.document_shares;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_permission not in ('view', 'edit') then
    raise exception 'Invalid permission';
  end if;

  select owner_id into v_owner
  from public.documents
  where id = p_document_id;

  if v_owner is null then
    raise exception 'Document not found';
  end if;

  if v_owner <> auth.uid() then
    raise exception 'Only the owner can share this document';
  end if;

  select id into v_target
  from public.profiles
  where email = lower(trim(p_email));

  if v_target is null then
    raise exception 'No Folio user found with that email. Ask them to sign up first.';
  end if;

  if v_target = auth.uid() then
    raise exception 'You already own this document';
  end if;

  insert into public.document_shares (document_id, shared_with_user_id, permission)
  values (p_document_id, v_target, p_permission)
  on conflict (document_id, shared_with_user_id)
  do update set permission = excluded.permission
  returning * into v_share;

  return v_share;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, delete on public.document_shares to authenticated;
grant execute on function public.share_document_by_email(uuid, text, text) to authenticated;
grant execute on function public.is_document_owner(uuid) to authenticated;
grant execute on function public.has_document_share(uuid, boolean) to authenticated;
