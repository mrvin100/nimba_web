import { PageHeader } from "@/components/shared/page-header";
import { CreateUserDialog } from "./create-user-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { AdminUsersTable } from "./admin-users-table";

/** Admin console: header + create/import actions + the managed-user table. */
export function AdminUsersDashboard() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Utilisateurs" description="Gestion des comptes et des accès">
        <BulkImportDialog />
        <CreateUserDialog />
      </PageHeader>
      <AdminUsersTable />
    </div>
  );
}
