"use client";

import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { ActorAvatar } from "@/components/shared/actor-avatar";
import { Pager } from "@/components/shared/pager";
import { WORKFLOW_ACTION_LABELS, type WorkflowEvent } from "./schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const PAGE_SIZE = 5;

/** One transition: actor + department on their own line, action, then the timestamp read out in full rather than as digits. */
function TimelineEntry({ event }: Readonly<{ event: WorkflowEvent }>) {
  const [commentOpen, setCommentOpen] = useState(false);

  return (
    <li className="flex gap-3">
      <ActorAvatar name={event.actorName} department={event.actorDepartment} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 border-l-2 pb-1 pl-3">
        <p className="text-sm font-medium">
          {event.actorName} <span className="font-normal text-muted-foreground">({DEPARTMENT_LABELS[event.actorDepartment]})</span>
        </p>
        <p className="text-sm text-muted-foreground">{WORKFLOW_ACTION_LABELS[event.action]}</p>
        <p className="text-xs text-muted-foreground">{formatDateTime(event.occurredAt, "long")}</p>
        {event.comment && (
          <Collapsible open={commentOpen} onOpenChange={setCommentOpen} className="mt-1.5">
            <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium hover:underline">
              <ChevronDown className={cn("size-3 transition-transform", commentOpen && "rotate-180")} />
              {commentOpen ? "Masquer le commentaire" : "Voir le commentaire"}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1.5 rounded-md border bg-muted/40 p-2 text-sm whitespace-pre-wrap">
              {event.comment}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </li>
  );
}

/** The dossier's audit-friendly history: every workflow transition, newest first, paged so it stays readable on a dossier with a long back-and-forth. */
export function WorkflowTimeline({ events }: Readonly<{ events: WorkflowEvent[] }>) {
  const [page, setPage] = useState(0);

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
  const pageCount = Math.ceil(newestFirst.length / PAGE_SIZE);
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = newestFirst.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-3">
      <ol className="space-y-4">
        {pageItems.map((event) => (
          <TimelineEntry key={event.id} event={event} />
        ))}
      </ol>
      {pageCount > 1 && (
        <Pager
          hasPrevious={currentPage > 0}
          hasNext={currentPage < pageCount - 1}
          onPrevious={() => setPage(currentPage - 1)}
          onNext={() => setPage(currentPage + 1)}
          label={`${newestFirst.length} événement${newestFirst.length > 1 ? "s" : ""} · page ${currentPage + 1}/${pageCount}`}
        />
      )}
    </div>
  );
}
