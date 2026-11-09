import { AuthForm } from "@/components/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#d7ebe8,transparent_45%),radial-gradient(circle_at_bottom_right,#d9e4f5,transparent_40%),linear-gradient(160deg,#eef3f7,#f8fafc)]" />
      <div className="relative w-full max-w-md rounded-2xl bg-white/85 p-8 shadow-lg ring-1 ring-slate-200 backdrop-blur">
        <p className="font-display text-4xl tracking-tight text-teal-900">Folio</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          Collaborative documents for fast teams
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in with a seeded demo account, or create one for local testing.
        </p>

        {!configured && (
          <div className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200">
            <p className="font-semibold">Supabase env vars not set yet</p>
            <p className="mt-1 text-xs leading-relaxed">
              Copy <code>.env.example</code> to <code>.env.local</code>, add your
              free Supabase project URL and anon key, run the SQL migration, then
              restart <code>npm run dev</code>.
            </p>
          </div>
        )}

        <div className="mt-6">
          <AuthForm disabled={!configured} />
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
          <p className="font-semibold text-slate-800">Demo accounts (after seed)</p>
          <p>Owner: owner@folio.test / FolioDemo1!</p>
          <p>Shared user: viewer@folio.test / FolioDemo1!</p>
        </div>
      </div>
      <p className="relative mt-8 text-center text-xs text-slate-500">
        Folio · collaborative documents demo
      </p>
    </main>
  );
}
