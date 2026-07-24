"use client";

import { useDocumentHistory } from "./useCaution";
import { formatDateTime } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/** Fields that changed between two content snapshots, oldest key order. */
function changedKeys(before: Record<string, string>, after: Record<string, string>): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => (before[key] ?? "") !== (after[key] ?? ""));
}

interface DocumentHistoryDialogProps {
  documentId: string;
  reference: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The edit history of a single document: what changed, when, by whom and why. */
export function DocumentHistoryDialog({ documentId, reference, open, onOpenChange }: DocumentHistoryDialogProps) {
  const { data, isPending } = useDocumentHistory(documentId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[95vw] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Historique du document</DialogTitle>
          <DialogDescription>{reference}</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune modification enregistrée.</p>
        ) : (
          <ol className="space-y-4">
            {data.map((version) => (
              <li key={version.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDateTime(version.createdAt)}</span>
                  {version.reason && <span className="italic">{version.reason}</span>}
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {changedKeys(version.contentBefore, version.contentAfter).map((key) => (
                    <li key={key}>
                      <span className="font-medium">{key}</span> : {version.contentBefore[key] || "∅"} →{" "}
                      {version.contentAfter[key] || "∅"}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
