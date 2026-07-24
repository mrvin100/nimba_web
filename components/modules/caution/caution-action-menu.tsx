"use client";

import { useState } from "react";
import { CheckCircle2, Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cautionDocxExportPath } from "./caution.service";
import { useDeleteCaution, useFinalizeCaution } from "./useCaution";
import { EditCautionDialog } from "./edit-caution-dialog";
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
 * Row actions: modify, preview and finalize while DRAFT, export once FINAL,
 * delete while DRAFT. A draft previews the .docx rendered from the live client
 * so it can be checked before finalizing; a finalized caution is an official
 * record the backend refuses to edit or delete, and only then carries the
 * frozen client snapshot. Clicks are stopped from bubbling to the row.
 */
export function CautionActionMenu({ caution }: Readonly<{ caution: CautionSummary }>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil />
              Modifier
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href={cautionDocxExportPath(caution.id)} download>
              {isDraft ? <Eye /> : <Download />}
              {isDraft ? "Prévisualiser (.docx)" : "Exporter (.docx)"}
            </a>
          </DropdownMenuItem>
          {isDraft && (
            <DropdownMenuItem onSelect={() => setConfirmFinalize(true)}>
              <CheckCircle2 />
              Finaliser
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

      {isDraft && <EditCautionDialog caution={caution} open={editOpen} onOpenChange={setEditOpen} />}

      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser la caution {caution.referenceNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document sera verrouillé et l&apos;identité du client figée telle qu&apos;elle est aujourd&apos;hui. Il ne
              sera plus modifiable ni supprimable ensuite. Cette action est irréversible.
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
