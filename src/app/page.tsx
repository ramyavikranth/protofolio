import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/profile";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
      <Dashboard
        userId={user.id}
        userEmail={profile.email || user.email || "unknown"}
        displayName={profile.display_name}
      />
    </AppShell>
  );
}
