"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { publicOrganizationLogoPath, useOrganizationName } from "@/components/modules/identity";
import type { WorkspaceConfig } from "./workspace-registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface WorkspaceSwitcherProps {
  active: WorkspaceConfig;
  workspaces: WorkspaceConfig[];
}

/** Sidebar header: active workspace with an org-scoped switcher when the user has several. */
export function WorkspaceSwitcher({ active, workspaces }: Readonly<WorkspaceSwitcherProps>) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const organization = useOrganizationName();
  const canSwitch = workspaces.length > 1;
  const orgName = organization.data?.organizationName ?? "Nimba";

  const logo = organization.data?.hasLogo ? (
    // Backend-served binary behind the session proxy: Next's optimizer cannot
    // fetch it (and it is already small), so serve it as-is.
    <Image src={publicOrganizationLogoPath()} alt="" width={16} height={16} unoptimized className="size-4 object-contain" />
  ) : (
    <Building2 className="size-4" />
  );

  const trigger = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        {logo}
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{active.label}</span>
        <span className="truncate text-xs">{active.subtitle}</span>
      </div>
      {canSwitch && <ChevronsUpDown className="ml-auto size-4" />}
    </SidebarMenuButton>
  );

  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>{trigger}</SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">{orgName}</DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.key} onSelect={() => router.push(workspace.basePath)}>
                <span className="flex-1">{workspace.label}</span>
                <span className="text-xs text-muted-foreground">{workspace.subtitle}</span>
                {workspace.key === active.key && <Check className="size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
