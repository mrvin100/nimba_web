"use client";

import { useState } from "react";
import { Download, History, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { cautionDocxExportPath } from "./caution.service";
import { useDeleteCaution } from "./useCaution";
import { CautionDocumentDialog } from "./caution-document-dialog";
import { DocumentHistoryDialog } from "./document-history-dialog";
import { CautionStatusBadge } from "./caution-status-badge";
import type { Caution, CautionDocumentType, CautionFieldDefinition } from "./schema";
import { formatAmount, formatDate } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** A document's rendered values: the dossier's common fields overridden by the document's own. */
function effective(common: Record<string, string>, docContent: Record<string, string>): Record<string, string> {
  const overrides = Object.fromEntries(Object.entries(docContent).filter(([, value]) => value));
  return { ...common, ...overrides };
}

interface CautionDocumentSectionProps {
  dossierId: string;
  clientId: string;
  documentType: CautionDocumentType;
  typeLabel: string;
  specificFields: CautionFieldDefinition[];
  documents: Caution[];
  commonContent: Record<string, string>;
  writable: boolean;
  requireReasonOnEdit: boolean;
}

/** One family section of the dossier workspace: a table of that type's documents with add and row actions. */
export function CautionDocumentSection({
  dossierId,
  clientId,
  documentType,
  typeLabel,
  specificFields,
  documents,
  commonContent,
  writable,
  requireReasonOnEdit,
}: CautionDocumentSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Caution | null>(null);
  const [history, setHistory] = useState<Caution | null>(null);
  const [deleting, setDeleting] = useState<Caution | null>(null);
  const remove = useDeleteCaution();

  return (
    <section className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{typeLabel}</h2>
        {writable && (
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Ajouter
          </Button>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun document.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Référence</th>
                <th className="py-2 pr-3 font-medium">Montant</th>
                <th className="py-2 pr-3 font-medium">Objet</th>
                <th className="py-2 pr-3 font-medium">Statut</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => {
                const merged = effective(commonContent, document.content);
                const montant = merged.montant ? formatAmount(Number(merged.montant)) : "—";
                return (
                  <tr key={document.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{document.referenceNumber}</td>
                    <td className="py-2 pr-3 tabular-nums">{montant}</td>
                    <td className="max-w-[16rem] truncate py-2 pr-3 text-muted-foreground">{merged.objetMarche ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <CautionStatusBadge status={document.status} />
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatDate(document.createdAt)}</td>
                    <td className="py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={cautionDocxExportPath(document.id)} download>
                              <Download />
                              Prévisualiser / Télécharger
                            </a>
                          </DropdownMenuItem>
                          {writable && (
                            <DropdownMenuItem onSelect={() => setEditing(document)}>
                              <Pencil />
                              Modifier
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => setHistory(document)}>
                            <History />
                            Historique
                          </DropdownMenuItem>
                          {writable && (
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(document)}>
                              <Trash2 />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CautionDocumentDialog
        dossierId={dossierId}
        clientId={clientId}
        documentType={documentType}
        typeLabel={typeLabel}
        fields={specificFields}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {editing && (
        <CautionDocumentDialog
          dossierId={dossierId}
          clientId={clientId}
          documentType={documentType}
          typeLabel={typeLabel}
          fields={specificFields}
          document={editing}
          requireReason={requireReasonOnEdit}
          open={Boolean(editing)}
          onOpenChange={(next) => !next && setEditing(null)}
        />
      )}

      {history && (
        <DocumentHistoryDialog
          documentId={history.id}
          reference={history.referenceNumber}
          open={Boolean(history)}
          onOpenChange={(next) => !next && setHistory(null)}
        />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleting?.referenceNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>Ce document sera définitivement supprimé du dossier.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
