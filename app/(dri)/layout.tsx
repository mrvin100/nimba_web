import { AppHeader } from "@/components/shared/app-header";

/**
 * Layout for the DRI analyst workspace. The `(dri)` route group gives this role
 * its own layout without adding a URL segment, so further roles can be added as
 * sibling groups later. The header self-hides when there is no session, so the
 * login page (which lives in this group) renders cleanly.
 */
export default function DriLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
