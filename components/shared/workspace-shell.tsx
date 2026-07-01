"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { landingPath, useSession } from "@/components/modules/identity";
import { AppSidebar } from "./app-sidebar";
import {
  accessibleWorkspaces,
  canAccessWorkspace,
  workspaceForPath,
} from "./workspace-registry";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/lib/constants";

/**
 * Authenticated application shell shared by every direction and the admin console.
 * It resolves the active workspace from the URL, enforces capability access
 * client-side (the backend remains the source of truth), and renders the
 * config-driven sidebar around the routed content. Unauthorised access is
 * redirected to the user's landing workspace; an unauthenticated visitor (cookie
 * expired mid-session) is sent to login.
 */
export function WorkspaceShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user } = useSession();
  const active = workspaceForPath(pathname);
  const allowed = Boolean(user && active && canAccessWorkspace(user, active));

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (!allowed) {
      router.replace(landingPath(user));
    }
  }, [loading, user, allowed, router]);

  if (loading || !user || !active || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy>
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar active={active} workspaces={accessibleWorkspaces(user)} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
