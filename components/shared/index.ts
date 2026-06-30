// Cross-cutting components shared across workspaces (sidebar, shell, data table).
export { AppSidebar } from "./app-sidebar";
export { WorkspaceShell } from "./workspace-shell";
export { WorkspacePlaceholder } from "./workspace-placeholder";
export { DataTable } from "./data-table";
export { QueryProvider } from "./query-provider";
export {
  WORKSPACES,
  accessibleWorkspaces,
  canAccessWorkspace,
  workspaceForPath,
} from "./workspace-registry";
export type { WorkspaceConfig, WorkspaceKey, NavItem } from "./workspace-registry";
