"use client";

import { Users } from "lucide-react";
import { DEPARTMENT_LABELS, type Department } from "@/components/modules/identity";
import { useTeamMembers } from "./useTeam";
import { teamMemberColumns } from "./team-columns";
import { InviteMemberDialog } from "./invite-member-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** Members management for a direction manager: list + invite + row actions. */
export function TeamMembersView({ department }: { department: Department }) {
  const { data, isPending, isError } = useTeamMembers();
  const members = (data ?? []).filter((member) => member.memberships.some((m) => m.department === department));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membres</h1>
          <p className="text-sm text-muted-foreground">{DEPARTMENT_LABELS[department]}</p>
        </div>
        <InviteMemberDialog department={department} />
      </div>

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
