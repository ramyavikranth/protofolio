import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/profile";
import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const current = await getCurrentProfile();
  if (!current) {
    redirect("/login");
  }

  const { user, profile } = current;

  return (
    <AppShell email={profile.email} displayName={profile.display_name}>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <ProfileForm
          userId={user.id}
          email={profile.email || user.email || ""}
          initialDisplayName={profile.display_name ?? ""}
        />
      </main>
    </AppShell>
  );
}
