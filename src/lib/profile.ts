import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? {
      id: user.id,
      email: user.email ?? "",
      display_name: user.email?.split("@")[0] ?? "User",
    },
  };
}
