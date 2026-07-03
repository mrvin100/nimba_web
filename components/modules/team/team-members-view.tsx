"use client";

import { Users } from "lucide-react";
import { DEPARTMENT_LABELS, type Department } from "@/components/modules/identity";
import { useTeamMembers } from "./useTeam";
import { teamMemberColumns } from "./team-columns";
import { InviteMemberDialog } from "./invite-member-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** Members management for a direction manager: list + invite + row actions. */
export function TeamMembersView({ department }: { department: Department }) {
  const { data, isPending, isError } = useTeamMembers();
  const members = (data ?? []).filter((member) => member.memberships.some((m) => m.department === department));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <PageHeader title="Membres" description={DEPARTMENT_LABELS[department]}>
        <InviteMemberDialog department={department} />
      </PageHeader>

      {isPending ? (
        <div className="space-y-2" aria-busy>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les membres. Veuillez réessayer.</p>
      ) : members.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Aucun membre</EmptyTitle>
            <EmptyDescription>Invitez le premier membre de cette direction.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable
          columns={teamMemberColumns}
          data={members}
          searchable
          searchPlaceholder="Rechercher un membre…"
          emptyMessage="Aucun membre."
        />
      )}
    </div>
  );
}
