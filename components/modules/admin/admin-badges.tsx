import { Badge } from "@/components/ui/badge";
import type { AccountStatus, DepartmentRole, Membership } from "@/components/modules/identity";

const STATUS_LABELS: Record<AccountStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Actif", variant: "default" },
  SUSPENDED: { label: "Suspendu", variant: "secondary" },
  REVOKED: { label: "Révoqué", variant: "destructive" },
};

const ROLE_LABELS: Record<DepartmentRole, string> = {
  MANAGER: "Manager",
  MEMBER: "Membre",
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const { label, variant } = STATUS_LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/** Renders a user's access as small chips: each direction/role plus the admin flag. */
export function MembershipBadges({ memberships, admin }: { memberships: Membership[]; admin: boolean }) {
  if (!admin && memberships.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {admin && <Badge variant="default">Admin</Badge>}
      {memberships.map((m) => (
        <Badge key={m.department} variant="outline">
          {m.department} · {ROLE_LABELS[m.role]}
        </Badge>
      ))}
    </div>
  );
}
