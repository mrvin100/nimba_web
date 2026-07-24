"use client";

import { useState } from "react";
import { CheckCircle2, Download, MoreHorizontal, Trash2 } from "lucide-react";
import { cautionDocxExportPath } from "./caution.service";
import { useDeleteCaution, useFinalizeCaution } from "./useCaution";
import type { CautionSummary } from "./schema";
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

/**
 * Row actions: finalize (locks the content and freezes the client snapshot —
 * every field was already collected at creation, so there is no separate
 * draft-editing screen to finalize from instead), export (once FINAL — a
 * draft has no snapshot to print) and delete (only while DRAFT — a finalized
 * caution is an official record, the backend rejects deleting it). Clicks
 * are stopped from bubbling to the row.
 */
export function CautionActionMenu({ caution }: Readonly<{ caution: CautionSummary }>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const remove = useDeleteCaution();
  const finalize = useFinalizeCaution(caution.id);
  const isDraft = caution.status === "DRAFT";

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={remove.isPending || finalize.isPending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isDraft && (
            <DropdownMenuItem onSelect={() => setConfirmFinalize(true)}>
              <CheckCircle2 />
              Finaliser
            </DropdownMenuItem>
          )}
          {!isDraft && (
            <DropdownMenuItem asChild>
              <a href={cautionDocxExportPath(caution.id)} download>
                <Download />
                Exporter (.docx)
              </a>
            </DropdownMenuItem>
          )}
          {isDraft && (
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
              <Trash2 />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser la caution {caution.referenceNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document sera verrouillé et l&apos;identité du client figée telle qu&apos;elle est aujourd&apos;hui —
              il ne sera plus modifiable ni supprimable ensuite. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => finalize.mutate()}>Finaliser</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la caution {caution.referenceNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce brouillon sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={() => remove.mutate(caution.id)}>
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
