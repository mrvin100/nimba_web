"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, LogOut } from "lucide-react";
import { useLogout, useSession } from "@/components/modules/identity";
import type { WorkspaceConfig } from "./workspace-registry";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  /** The workspace currently being viewed. */
  active: WorkspaceConfig;
  /** All workspaces the user may switch to (drives the header switcher). */
  workspaces: WorkspaceConfig[];
}

/**
 * Config-driven workspace sidebar: header shows the active workspace (with a
 * switcher when the user belongs to more than one), the navigation is read from the
 * workspace registry, and the footer carries the user identity and logout. One
 * sidebar serves every direction and the admin console.
 */
export function AppSidebar({ active, workspaces }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();
  const canSwitch = workspaces.length > 1;

  return (
    <Sidebar>
      <SidebarHeader>
        {canSwitch ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent"
              >
                <span>
                  <span className="block text-base font-semibold tracking-tight">{active.label}</span>
                  <span className="block text-xs text-muted-foreground">{active.subtitle}</span>
                </span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
              {workspaces.map((workspace) => (
                <DropdownMenuItem key={workspace.key} onSelect={() => router.push(workspace.basePath)}>
                  <span className="flex-1">{workspace.label}</span>
                  {workspace.key === active.key && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-2 py-1.5">
            <p className="text-base font-semibold tracking-tight">{active.label}</p>
            <p className="text-xs text-muted-foreground">{active.subtitle}</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {active.nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="truncate text-sm text-muted-foreground">{user?.fullName ?? "—"}</span>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOut />
            <span className="sr-only">Se déconnecter</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
