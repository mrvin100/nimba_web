import { OrganizationForm } from "./organization-form";
import { OrganizationLogoCard } from "./organization-logo-card";

/** Admin organisation settings screen. */
export function OrganizationDashboard() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organisation</h1>
        <p className="text-sm text-muted-foreground">Paramètres généraux, logo et expéditeur des e-mails</p>
      </div>
      <OrganizationLogoCard />
      <OrganizationForm />
    </div>
  );
}
