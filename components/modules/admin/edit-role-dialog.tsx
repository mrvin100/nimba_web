"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "@/lib/api-error";
import { useUpdateUserMemberships } from "./useAdmin";
import { MembershipFields } from "./membership-fields";
import {
  editMembershipsSchema,
  hasAnyAssignment,
  toEditMembershipsDefaults,
  toUpdateMembershipsPayload,
  type AdminUser,
  type EditMembershipsInput,
} from "./schema";
import { SubmitButton } from "@/components/shared/submit-button";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";

/**
 * Edits a managed user's directions/roles and admin flag. A role change can take
 * away access the user relies on right now, so submitting the form does not save
 * directly — it opens an explicit confirmation before the change is applied.
 */
export function EditRoleDialog({
  user,
  open,
  onOpenChange,
}: Readonly<{ user: AdminUser; open: boolean; onOpenChange: (open: boolean) => void }>) {
  const [pendingValues, setPendingValues] = useState<EditMembershipsInput | null>(null);
  const updateMemberships = useUpdateUserMemberships();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditMembershipsInput>({
    resolver: zodResolver(editMembershipsSchema),
    defaultValues: toEditMembershipsDefaults(user),
  });

  useEffect(() => {
    if (open) reset(toEditMembershipsDefaults(user));
  }, [open, user, reset]);

  function onSubmit(values: EditMembershipsInput) {
    if (!hasAnyAssignment(values)) {
      setError("root", { message: "Attribuez au moins une direction ou le rôle administrateur." });
      return;
    }
    setPendingValues(values);
  }

  function confirm() {
    if (!pendingValues) return;
    updateMemberships.mutate(
      { id: user.id, payload: toUpdateMembershipsPayload(pendingValues) },
      {
        onSuccess: () => {
          setPendingValues(null);
          onOpenChange(false);
        },
        onError: (error) => {
          setPendingValues(null);
          setError("root", { message: getErrorMessage(error) });
        },
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les rôles : <strong>{user.fullName}</strong></DialogTitle>
            <DialogDescription>
              Choisissez le rôle de chaque direction. Le changement ne sera appliqué qu&apos;après confirmation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <MembershipFields control={control} />
              {errors.root && <FieldError errors={[errors.root]} />}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <SubmitButton formState={{ isSubmitting: updateMemberships.isPending }}>Continuer</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingValues !== null} onOpenChange={(next) => !next && setPendingValues(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le changement de rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              {user.fullName}{" "}
              perdra immédiatement l&apos;accès lié à son rôle actuel et n&apos;aura plus que les accès
              nouvellement attribués. Cette action s&apos;applique tout de suite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={updateMemberships.isPending}
              onClick={confirm}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
