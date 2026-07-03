import { PageHeader } from "@/components/shared/page-header";
import { OrganizationForm } from "./organization-form";
import { OrganizationLogoCard } from "./organization-logo-card";

/** Admin organisation settings screen. */
export function OrganizationDashboard() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      <PageHeader title="Organisation" description="Paramètres généraux, logo et expéditeur des e-mails" />
      <OrganizationLogoCard />
      <OrganizationForm />
    </div>
  );
}
