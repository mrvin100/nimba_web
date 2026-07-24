"use client";

import { useSession } from "@/components/modules/identity";
import type { WorkspaceConfig } from "./workspace-registry";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  /** The workspace currently being viewed. */
  active: WorkspaceConfig;
  /** All workspaces the user may switch to (drives the header switcher). */
  workspaces: WorkspaceConfig[];
}

/**
 * Config-driven workspace sidebar (sidebar-07 pattern): collapsible icon rail,
 * org-scoped workspace switcher, registry navigation, and account menu.
 */
export function AppSidebar({ active, workspaces }: Readonly<AppSidebarProps>) {
  const session = useSession();
  const navItems = active.nav.filter(
    (item) => !item.managerOnly || (active.department != null && session.isManager(active.department)),
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher active={active} workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav items={navItems} department={active.department} />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
