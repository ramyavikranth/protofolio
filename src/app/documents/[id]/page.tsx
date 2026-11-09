import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/profile";
import { AppShell } from "@/components/AppShell";
import { DocumentWorkspace } from "@/components/DocumentWorkspace";
import type { DocumentRow, SharePermission } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: PageProps) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const current = await getCurrentProfile();
  if (!current) {
    redirect("/login");
  }

  const { user, profile } = current;
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !document) {
    notFound();
  }

  let permission: SharePermission | "owner" = "owner";

  if (document.owner_id !== user.id) {
    const { data: share } = await supabase
      .from("document_shares")
      .select("permission")
      .eq("document_id", id)
      .eq("shared_with_user_id", user.id)
      .maybeSingle();

    if (!share) {
      notFound();
    }
    permission = share.permission as SharePermission;
  }

  return (
    <AppShell email={profile.email} displayName={profile.display_name}>
      <DocumentWorkspace
        document={document as DocumentRow}
        userId={user.id}
        permission={permission}
      />
    </AppShell>
  );
}
