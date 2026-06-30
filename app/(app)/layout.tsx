import { WorkspaceShell } from "@/components/shared";

/**
 * Layout for every authenticated workspace (the three directions and the admin
 * console). The shared shell resolves the active workspace from the URL, gates
 * access by capability, and renders the sidebar. Each direction is a real path
 * segment under this group (/dri, /dcm, /drc, /admin) so a single shell serves all.
 */
export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
