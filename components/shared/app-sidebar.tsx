"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { logout, useSession } from "@/components/modules/identity";
import { Button } from "@/components/ui/button";
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

const NAV = [{ label: "Dossiers", href: ROUTES.DASHBOARD, icon: FileText }];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();

  async function onLogout() {
    await logout();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <p className="text-base font-semibold tracking-tight">Nimba</p>
          <p className="text-xs text-muted-foreground">Espace analyste DRI</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
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
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut />
            <span className="sr-only">Se déconnecter</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
