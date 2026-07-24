"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Department } from "@/components/modules/identity";
import { useWorkflowQueue, WORKFLOW_REVIEW_DEPARTMENT } from "@/components/modules/workflow";
import type { NavItem } from "./workspace-registry";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  items: NavItem[];
  groupLabel?: string;
  /** The active workspace's direction — scopes the review-queue badge to it. */
  department?: Department | null;
}

/**
 * Workspace navigation with active-state resolution, icon-mode tooltips and
 * contextual sub-entries (sidebar-07 NavMain pattern): when an item resolves
 * sub-items for the current path (e.g. the open dossier's tabs), it expands
 * into a collapsible sub-menu while the parent stays a plain link to its list.
 * An item flagged `queueBadge` additionally shows how many dossiers are
 * waiting on this direction right now — visible everywhere in the workspace,
 * not just once you happen to open the dossier whose turn it is.
 */
export function SidebarNav({ items, groupLabel = "Navigation", department }: Readonly<SidebarNavProps>) {
  const pathname = usePathname();
  const hasQueueBadge = items.some((item) => item.queueBadge);
  const { data: queue } = useWorkflowQueue(hasQueueBadge);
  const queueCount = department ? (queue?.filter((item) => WORKFLOW_REVIEW_DEPARTMENT[item.status] === department).length ?? 0) : 0;

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
          const badge = item.queueBadge && queueCount > 0 && (
            <SidebarMenuBadge className="bg-primary text-primary-foreground">
              {queueCount > 9 ? "9+" : queueCount}
            </SidebarMenuBadge>
          );

          if (subItems.length === 0) {
            return (
              <SidebarMenuItem key={item.href}>
                {button}
                {badge}
              </SidebarMenuItem>
            );
          }

          // No badge here: once a dossier is open, its own workflow panel already
          // shows what's pending on it, and the chevron trigger owns this same
          // top-right slot.
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
