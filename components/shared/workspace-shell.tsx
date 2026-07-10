"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { landingPath, useSession } from "@/components/modules/identity";
import { NotificationBell } from "@/components/modules/notification";
import { AppSidebar } from "./app-sidebar";
import {
  accessibleWorkspaces,
  canAccessWorkspace,
  workspaceForPath,
} from "./workspace-registry";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
  // Cross-workspace pages (e.g. /profile) have no path segment of their own:
  // they render inside the user's landing workspace so the shell stays present.
  const active = workspaceForPath(pathname) ?? (user ? workspaceForPath(landingPath(user)) : undefined);
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

  const section = active.nav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .reduce<string | undefined>(
      (best, item) => (best === undefined || item.href.length > best.length ? item.label : best),
      undefined,
    );

  const onWorkspaceRoot = pathname === active.basePath;

  return (
    <SidebarProvider>
      <AppSidebar active={active} workspaces={accessibleWorkspaces(user)} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {section && !onWorkspaceRoot ? (
                    <BreadcrumbLink asChild>
                      <Link href={active.basePath}>{active.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{active.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {section && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{section}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4">
            <NotificationBell />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
