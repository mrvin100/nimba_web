"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { NavItem } from "./workspace-registry";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  items: NavItem[];
  groupLabel?: string;
}

/**
 * Workspace navigation with active-state resolution, icon-mode tooltips and
 * contextual sub-entries (sidebar-07 NavMain pattern): when an item resolves
 * sub-items for the current path (e.g. the open dossier's tabs), it expands
 * into a collapsible sub-menu while the parent stays a plain link to its list.
 */
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
        {items.map((item) => {
          const subItems = item.subItems?.(pathname) ?? [];
          const button = (
            <SidebarMenuButton asChild isActive={item.href === activeHref} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          );

          if (subItems.length === 0) {
            return <SidebarMenuItem key={item.href}>{button}</SidebarMenuItem>;
          }

          return (
            <Collapsible key={item.href} asChild defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                {button}
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200">
                    <ChevronRight />
                    <span className="sr-only">Déplier</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {subItems.map((sub) => (
                      <SidebarMenuSubItem key={sub.href}>
                        <SidebarMenuSubButton asChild>
                          <Link href={sub.href}>
                            <span>{sub.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
