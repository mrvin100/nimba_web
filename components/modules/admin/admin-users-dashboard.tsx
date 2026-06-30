import { CreateUserDialog } from "./create-user-dialog";
import { AdminUsersTable } from "./admin-users-table";

/** Admin console: header + create action + the managed-user table. */
export function AdminUsersDashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gestion des comptes et des accès</p>
        </div>
        <CreateUserDialog />
      </div>
      <AdminUsersTable />
    </div>
  );
}
