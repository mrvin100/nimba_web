"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, MoreHorizontal, Trash2 } from "lucide-react";
import { useArchiveCreditCase, useDeleteCreditCase } from "./useCreditCase";
import type { CreditCaseSummary } from "./schema";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Administrative actions on a dossier row (platform admins only): archive /
 * restore reorganise the list without destroying anything, deletion is
 * irreversible (the schedules, trades and retained files go with the case) so it
 * always confirms through an AlertDialog — never straight from the menu. Clicks
 * are stopped from bubbling to the row, which would open the dossier.
 */
export function CaseActionMenu({ creditCase }: Readonly<{ creditCase: CreditCaseSummary }>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const archive = useArchiveCreditCase();
  const remove = useDeleteCreditCase();
  const archived = creditCase.archivedAt !== null;
  const pending = archive.isPending || remove.isPending;

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={pending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => archive.mutate({ id: creditCase.id, archive: !archived })}>
            {archived ? <ArchiveRestore /> : <Archive />}
            {archived ? "Restaurer" : "Archiver"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <Trash2 />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier {creditCase.caseNumber} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dossier de {creditCase.clientName}, ses échéanciers importés et ses traités générés seront
              définitivement supprimés. Cette action est irréversible — pour simplement le retirer de la liste,
              préférez l&apos;archivage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => remove.mutate(creditCase.id)}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
