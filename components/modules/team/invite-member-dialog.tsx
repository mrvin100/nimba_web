"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import type { Department } from "@/components/modules/identity";
import { useInviteMember } from "./useTeam";
import { inviteMemberSchema, type InviteMemberInput } from "./schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Manager action: invite a member into the given direction. */
export function InviteMemberDialog({ department }: { department: Department }) {
  const [open, setOpen] = useState(false);
  const invite = useInviteMember();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { fullName: "", email: "" },
  });

  async function onSubmit(values: InviteMemberInput) {
    try {
      const invited = await invite.mutateAsync({ ...values, department });
      toast.success(`Invitation envoyée à ${invited.email}`);
      setOpen(false);
      reset();
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus />
          Inviter un membre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre — {department}</DialogTitle>
          <DialogDescription>
            Le membre recevra une invitation pour définir son mot de passe et rejoindre la direction {department}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nom complet</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="off" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adresse e-mail</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} autoComplete="off" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi…" : "Envoyer l'invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
