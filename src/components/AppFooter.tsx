export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-base text-teal-900">Folio</span>
          {" — "}
          lightweight collaborative documents
        </p>
        <p className="text-xs">
          Supported imports: .txt and .md · Built for the Ajaia assignment demo
        </p>
      </div>
    </footer>
  );
}
