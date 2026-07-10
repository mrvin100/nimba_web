"use client";

import { Trash2 } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { EditGuaranteeDialog } from "./edit-guarantee-dialog";
import { GuaranteeAttachments } from "./guarantee-attachments";
import { useDeleteGuarantee } from "./useGuarantee";
import { GUARANTEE_KIND_LABELS, type Guarantee } from "./schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

/** One guarantee: type + description, its proof files, and DRI-only edit/delete. */
export function GuaranteeCard({ caseId, guarantee }: Readonly<{ caseId: string; guarantee: Guarantee }>) {
  const session = useSession();
  const canEdit = session.hasDepartment("DRI");
  const deleteGuarantee = useDeleteGuarantee(caseId);

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge variant={guarantee.kind === "DETENUE" ? "default" : "outline"}>{GUARANTEE_KIND_LABELS[guarantee.kind]}</Badge>
          <p className="text-sm">{guarantee.description}</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <EditGuaranteeDialog caseId={caseId} guarantee={guarantee} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label="Supprimer la garantie">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette garantie ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La garantie et ses pièces jointes seront définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={() => deleteGuarantee.mutate(guarantee.id)}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <GuaranteeAttachments caseId={caseId} guarantee={guarantee} />
    </div>
  );
}
