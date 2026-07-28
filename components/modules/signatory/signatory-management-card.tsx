"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteSignatory, useSignatories } from "./useSignatory";
import { CreateSignatoryDialog } from "./create-signatory-dialog";
import { EditSignatoryDialog } from "./edit-signatory-dialog";
import { SIGNATORY_CATEGORY_LABELS, type Signatory } from "./schema";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SignatoryRow({ signatory }: Readonly<{ signatory: Signatory }>) {
  const remove = useDeleteSignatory();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{signatory.nom}</p>
          <Badge variant="outline">{SIGNATORY_CATEGORY_LABELS[signatory.category]}</Badge>
          {signatory.authorizations.length === 0 ? (
            <Badge variant="secondary">Global</Badge>
          ) : (
            signatory.authorizations.map((a) => (
              <Badge key={`${a.department}-${a.departmentRole}`} variant="secondary">
                {a.department} {a.departmentRole === "MANAGER" ? "Manager" : "Membre"}
              </Badge>
            ))
          )}
        </div>
        <p className="text-sm text-muted-foreground">{signatory.titre}</p>
        <p className="text-xs text-muted-foreground">{signatory.creationReason}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          <span className="sr-only">Modifier</span>
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      </div>

      <EditSignatoryDialog signatory={signatory} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {signatory.nom} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce signataire ne sera plus proposé sur les documents à venir. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => remove.mutate(signatory.id)}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Standalone signatories (no user account) — a user with an account opts in on
 * their own profile instead, and needs no admin action here.
 */
export function SignatoryManagementCard() {
  const { data, isPending, isError } = useSignatories();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Signataires sans compte</CardTitle>
          <CardDescription>
            Pour une personne sans profil dans le système. Un utilisateur avec un compte devient signataire depuis son
            propre profil.
          </CardDescription>
        </div>
        <CreateSignatoryDialog />
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les signataires. Veuillez réessayer.</p>
        ) : data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucun signataire sans compte pour le moment.</p>
        ) : (
          data.map((signatory) => <SignatoryRow key={signatory.id} signatory={signatory} />)
        )}
      </CardContent>
    </Card>
  );
}
