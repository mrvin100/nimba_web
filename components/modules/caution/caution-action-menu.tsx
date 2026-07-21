"use client";

import { useState } from "react";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";
import { cautionDocxExportPath } from "./caution.service";
import { useDeleteCaution } from "./useCaution";
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
 * Row actions: export (once FINAL — a draft has no client snapshot to print)
 * and delete (only while DRAFT — a finalized caution is an official record,
 * the backend rejects deleting it). Clicks are stopped from bubbling to the
 * row.
 */
export function CautionActionMenu({ caution }: Readonly<{ caution: CautionSummary }>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteCaution();
  const isDraft = caution.status === "DRAFT";

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={remove.isPending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
