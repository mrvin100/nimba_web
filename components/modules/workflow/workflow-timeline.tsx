import { History } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { WORKFLOW_ACTION_LABELS, type WorkflowEvent } from "./schema";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** The dossier's audit-friendly history: every workflow transition, newest first. */
export function WorkflowTimeline({ events }: Readonly<{ events: WorkflowEvent[] }>) {
  if (events.length === 0) {
    return (
      <Empty className="border-0 py-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>Aucun historique</EmptyTitle>
          <EmptyDescription>Les actions sur ce dossier apparaîtront ici.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const newestFirst = [...events].reverse();

  return (
    <ol className="space-y-4">
      {newestFirst.map((event) => (
        <li key={event.id} className="border-l-2 pl-4">
          <p className="text-sm font-medium">
            {WORKFLOW_ACTION_LABELS[event.action]} — {event.actorName} ({DEPARTMENT_LABELS[event.actorDepartment]})
          </p>
          <p className="text-xs text-muted-foreground">{formatDateTime(event.occurredAt)}</p>
          {event.comment && <p className="mt-1 text-sm whitespace-pre-wrap">{event.comment}</p>}
        </li>
      ))}
    </ol>
  );
}
