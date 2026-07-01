import { Building2, FileText, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEPARTMENT_LABELS, hasDepartment, isAdmin, type Department, type MeResponse } from "@/components/modules/identity";

/**
 * Config-driven workspace registry. Each top-level area (the three directions plus
 * the admin console) is described once here — label, base path, navigation, and the
 * access predicate — and every consumer (shell, sidebar, switcher, redirect guard)
 * derives its behaviour from this list. Adding a direction or a nav entry is a
 * single edit here, not a new layout tree.
 */

export type WorkspaceKey = "dri" | "dcm" | "drc" | "admin";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to a manager of the workspace's direction. */
  managerOnly?: boolean;
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

export const WORKSPACES: readonly WorkspaceConfig[] = [
  {
    key: "dri",
    department: "DRI",
    label: "DRI",
    subtitle: DEPARTMENT_LABELS.DRI,
    basePath: ROUTES.DRI,
    nav: [
      { label: "Dossiers", href: ROUTES.DRI, icon: FileText },
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
      { label: "Tableau de bord", href: ROUTES.DCM, icon: LayoutDashboard },
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
      { label: "Tableau de bord", href: ROUTES.DRC, icon: LayoutDashboard },
      { label: "Membres", href: `${ROUTES.DRC}/equipe`, icon: Users, managerOnly: true },
    ],
  },
  {
    key: "admin",
    department: null,
    label: "Administration",
    subtitle: "Gestion des utilisateurs",
    basePath: ROUTES.ADMIN,
    nav: [
      { label: "Utilisateurs", href: ROUTES.ADMIN, icon: Users },
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
