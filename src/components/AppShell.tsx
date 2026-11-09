import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

type Props = {
  children: React.ReactNode;
  email?: string | null;
  displayName?: string | null;
};

export function AppShell({ children, email, displayName }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#e8f1f5_0%,#f7fafc_28%,#f7fafc_100%)]">
      <AppHeader email={email} displayName={displayName} />
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  );
}
