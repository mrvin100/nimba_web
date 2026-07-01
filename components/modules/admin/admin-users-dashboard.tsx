import { CreateUserDialog } from "./create-user-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { AdminUsersTable } from "./admin-users-table";

/** Admin console: header + create/import actions + the managed-user table. */
export function AdminUsersDashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gestion des comptes et des accès</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkImportDialog />
          <CreateUserDialog />
        </div>
      </div>
      <AdminUsersTable />
    </div>
  );
}
