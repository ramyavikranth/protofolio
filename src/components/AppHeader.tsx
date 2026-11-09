"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email?: string | null;
  displayName?: string | null;
};

export function AppHeader({ email, displayName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const label = displayName?.trim() || email || "Account";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
      pathname === href
        ? "bg-teal-800 text-white"
        : "text-slate-700 hover:bg-white/80"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f3f7fa]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-2xl tracking-tight text-teal-950">
            Folio
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/" className={linkClass("/")}>
              Documents
            </Link>
            <Link href="/profile" className={linkClass("/profile")}>
              Profile
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="hidden max-w-[12rem] truncate text-sm text-slate-600 sm:block hover:text-teal-900"
            title={email ?? undefined}
          >
            {label}
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
