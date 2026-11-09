-- Fix: documents <-> document_shares RLS policies caused infinite recursion.
-- Run this in Supabase SQL Editor after 001_initial.sql.

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

create or replace function public.can_read_document(p_document_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_document_owner(p_document_id)
    or exists (
      select 1
      from public.document_shares s
      where s.document_id = p_document_id
        and s.shared_with_user_id = auth.uid()
    );
$$;

create or replace function public.can_edit_document(p_document_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_document_owner(p_document_id)
    or exists (
      select 1
      from public.document_shares s
      where s.document_id = p_document_id
        and s.shared_with_user_id = auth.uid()
        and s.permission = 'edit'
    );
$$;

drop policy if exists "documents_select_own_or_shared" on public.documents;
create policy "documents_select_own_or_shared"
  on public.documents for select
  to authenticated
  using (public.can_read_document(id));

drop policy if exists "documents_update_own_or_edit_share" on public.documents;
create policy "documents_update_own_or_edit_share"
  on public.documents for update
  to authenticated
  using (public.can_edit_document(id))
  with check (public.can_edit_document(id));

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

grant execute on function public.is_document_owner(uuid) to authenticated;
grant execute on function public.can_read_document(uuid) to authenticated;
grant execute on function public.can_edit_document(uuid) to authenticated;
