import {
  Building2,
  ClipboardList,
  FileStack,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEPARTMENT_LABELS, hasDepartment, isAdmin, type Department, type MeResponse } from "@/components/modules/identity";

/**
 * Config-driven workspace registry. Each top-level area (the three directions plus
 * the admin console) is described once here — label, base path, navigation, and the
 * access predicate — and every consumer (shell, sidebar, switcher, redirect guard)
 * derives its behaviour from this list. Adding a direction or a nav entry is a
 * single edit here, not a new layout tree.
 */

export type WorkspaceKey = "dri" | "dcm" | "drc" | "comite" | "admin";

export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to a manager of the workspace's direction. */
  managerOnly?: boolean;
  /**
   * Contextual sub-entries resolved from the current path (e.g. the open
   * dossier's tabs). Empty ⇒ the item renders as a plain link.
   */
  subItems?: (pathname: string) => NavSubItem[];
  /**
   * Shows the caller's review-queue count as a sidebar badge (dossiers waiting
   * on this direction) — visible from anywhere in the workspace, not just the
   * FA tab of one dossier, so the direction doesn't have to remember to check.
   */
  queueBadge?: boolean;
}

export interface WorkspaceConfig {
  key: WorkspaceKey;
  /** Direction code backing this workspace, or null for the cross-cutting admin area. */
  department: Department | null;
  label: string;
  subtitle: string;
  basePath: string;
  nav: NavItem[];
}

/**
 * The open dossier's tabs, exposed as contextual sub-navigation under the
 * workspace's dossier list — same tabs in every direction (each document tab
 * is read-only outside its authoring direction; the page itself decides what
 * the viewer can do). One tab per generated/imported document — Amortissement
 * (TA), Fiche d'analyse (FA), PV and FMP — same as the physical dossier is
 * organized, instead of stacking every document under one overview screen.
 */
function dossierSubItems(base: RegExp): (pathname: string) => NavSubItem[] {
  return (pathname) => {
    const match = pathname.match(base);
    if (!match) return [];
    return [
      { label: "Aperçu du dossier", href: `${match[0]}?tab=apercu` },
      { label: "Fiche d'analyse", href: `${match[0]}?tab=fiche-analyse` },
      { label: "Amortissement", href: `${match[0]}?tab=amortissement` },
      { label: "PV", href: `${match[0]}?tab=pv` },
      { label: "FMP", href: `${match[0]}?tab=fmp` },
    ];
  };
}

export const WORKSPACES: readonly WorkspaceConfig[] = [
  {
    key: "dri",
    department: "DRI",
    label: "DRI",
    subtitle: DEPARTMENT_LABELS.DRI,
    basePath: ROUTES.DRI,
    nav: [
      {
        label: "Dossiers",
        href: ROUTES.DRI,
        icon: FileText,
        // When a dossier is open, expose its tabs as sub-navigation; the parent
        // stays a link to the full list. The DRI additionally gets the Settings
        // tab (critical actions — the page itself gates manager/admin).
        subItems: (pathname) => {
          const items = dossierSubItems(/^\/dri\/dossiers\/[^/]+/)(pathname);
          if (items.length === 0) return items;
          const match = pathname.match(/^\/dri\/dossiers\/[^/]+/);
          return [...items, { label: "Paramètres", href: `${match?.[0]}?tab=parametres` }];
        },
      },
      { label: "Membres", href: `${ROUTES.DRI}/equipe`, icon: Users, managerOnly: true },
    ],
  },
  {
    key: "dcm",
    department: "DCM",
    label: "DCM",
    subtitle: DEPARTMENT_LABELS.DCM,
    basePath: ROUTES.DCM,
    nav: [
      {
        label: "Dossiers à revoir",
        href: ROUTES.DCM,
        icon: ClipboardList,
        queueBadge: true,
      },
      {
        label: "Tous les dossiers",
        href: `${ROUTES.DCM}/dossiers`,
        icon: FolderOpen,
        subItems: dossierSubItems(/^\/dcm\/dossiers\/[^/]+/),
      },
      { label: "Cautions", href: `${ROUTES.DCM}/cautions`, icon: FileStack },
      { label: "Membres", href: `${ROUTES.DCM}/equipe`, icon: Users, managerOnly: true },
    ],
  },
  {
    key: "drc",
    department: "DRC",
    label: "DRC",
    subtitle: DEPARTMENT_LABELS.DRC,
    basePath: ROUTES.DRC,
    nav: [
      {
        label: "Dossiers à revoir",
        href: ROUTES.DRC,
        icon: ClipboardList,
        queueBadge: true,
      },
      {
        label: "Tous les dossiers",
        href: `${ROUTES.DRC}/dossiers`,
        icon: FolderOpen,
        subItems: dossierSubItems(/^\/drc\/dossiers\/[^/]+/),
      },
      { label: "Membres", href: `${ROUTES.DRC}/equipe`, icon: Users, managerOnly: true },
    ],
  },
  {
    key: "comite",
    department: "COMITE",
    label: "Comité",
    subtitle: DEPARTMENT_LABELS.COMITE,
    basePath: ROUTES.COMITE,
    nav: [
      {
        label: "Dossiers à revoir",
        href: ROUTES.COMITE,
        icon: ClipboardList,
        queueBadge: true,
      },
      {
        label: "Tous les dossiers",
        href: `${ROUTES.COMITE}/dossiers`,
        icon: FolderOpen,
        subItems: dossierSubItems(/^\/comite\/dossiers\/[^/]+/),
      },
      { label: "Membres", href: `${ROUTES.COMITE}/equipe`, icon: Users, managerOnly: true },
    ],
  },
  {
    key: "admin",
    department: null,
    label: "Administration",
    subtitle: "Pilotage de la plateforme",
    basePath: ROUTES.ADMIN,
    nav: [
      { label: "Tableau de bord", href: ROUTES.ADMIN, icon: LayoutDashboard },
      { label: "Utilisateurs", href: ROUTES.ADMIN_USERS, icon: Users },
      { label: "Journal d'audit", href: ROUTES.ADMIN_AUDIT, icon: ScrollText },
      { label: "Organisation", href: ROUTES.ADMIN_ORGANIZATION, icon: Building2 },
    ],
  },
];

/** Whether the user may enter the given workspace. */
export function canAccessWorkspace(user: MeResponse, workspace: WorkspaceConfig): boolean {
  return workspace.department ? hasDepartment(user, workspace.department) : isAdmin(user);
}

/** The workspaces a user may enter, in registry order (used by the switcher). */
export function accessibleWorkspaces(user: MeResponse): WorkspaceConfig[] {
  return WORKSPACES.filter((workspace) => canAccessWorkspace(user, workspace));
}

/** Resolves the active workspace from the first path segment (e.g. /dri/... -> dri). */
export function workspaceForPath(pathname: string): WorkspaceConfig | undefined {
  const segment = pathname.split("/")[1];
  return WORKSPACES.find((workspace) => workspace.key === segment);
}
