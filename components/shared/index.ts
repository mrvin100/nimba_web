// Cross-cutting components shared across workspaces (sidebar, shell, data table).
export { AppSidebar } from "./app-sidebar";
export { WorkspaceShell } from "./workspace-shell";
export { WorkspacePlaceholder } from "./workspace-placeholder";
export { DataTable } from "./data-table";
export { Pager } from "./pager";
export { PasswordInput } from "./password-input";
export { FileDropzone } from "./file-dropzone";
export { ThemeProvider } from "./theme-provider";
export { ThemeToggle } from "./theme-toggle";
export { UserMenu } from "./user-menu";
export { QueryProvider } from "./query-provider";
export { SubmitButton } from "./submit-button";
export { StatusActionMenu } from "./status-action-menu";
export { PageHeader } from "./page-header";
export { SidebarNav } from "./sidebar-nav";
export { WorkspaceSwitcher } from "./workspace-switcher";
export type { LifecycleAction, LifecycleStatus } from "./status-action-menu";
export {
  WORKSPACES,
  accessibleWorkspaces,
  canAccessWorkspace,
  workspaceForPath,
} from "./workspace-registry";
export type { WorkspaceConfig, WorkspaceKey, NavItem, NavSubItem } from "./workspace-registry";
