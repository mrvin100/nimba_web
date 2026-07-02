"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./workspace-registry";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  items: NavItem[];
  groupLabel?: string;
}

/** Flat workspace navigation with active-state resolution and icon-mode tooltips. */
export function SidebarNav({ items, groupLabel = "Navigation" }: Readonly<SidebarNavProps>) {
  const pathname = usePathname();

  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .reduce<string | undefined>(
      (best, item) => (best === undefined || item.href.length > best.length ? item.href : best),
      undefined,
    );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={item.href === activeHref} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
