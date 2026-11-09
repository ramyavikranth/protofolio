-- Fix insert + returning select without RLS recursion.
-- Owner checks use owner_id = auth.uid() directly.
-- Share checks use a SECURITY DEFINER function that only reads document_shares.

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

grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, delete on public.document_shares to authenticated;
grant execute on function public.has_document_share(uuid, boolean) to authenticated;
grant execute on function public.is_document_owner(uuid) to authenticated;
