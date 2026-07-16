"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
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
import type { LucideIcon } from "lucide-react";

export type LifecycleAction = "suspend" | "reactivate" | "revoke";
export type LifecycleStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";

const ACTION_LABELS: Record<LifecycleAction, string> = {
  suspend: "Suspendre",
  reactivate: "Réactiver",
  revoke: "Révoquer",
};

/** Lifecycle transitions offered for a given current status. */
function actionsFor(status: LifecycleStatus): LifecycleAction[] {
  switch (status) {
    case "ACTIVE":
      return ["suspend", "revoke"];
    case "SUSPENDED":
      return ["reactivate", "revoke"];
    case "REVOKED":
      return ["reactivate"];
  }
}

/** An action unrelated to the account lifecycle, plugged into the same menu (e.g. password reset). */
export interface ExtraMenuAction {
  key: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onSelect: () => void;
}

interface StatusActionMenuProps {
  /** Display name of the account the actions apply to. */
  name: string;
  status: LifecycleStatus;
  pending: boolean;
  /** Runs the transition (the module's mutation); errors are toasted here. */
  onAction: (action: LifecycleAction) => Promise<unknown>;
  /** Extra items rendered above the lifecycle actions, separated by a divider. */
  extraActions?: ExtraMenuAction[];
}

/**
 * Row action menu for an account lifecycle (suspend / reactivate / revoke),
 * shared by the admin and team tables so the two behave identically. Revoking is
 * irreversible in spirit (the user loses access immediately), so it asks for an
 * explicit confirmation instead of firing straight from the menu.
 */
export function StatusActionMenu({ name, status, pending, onAction, extraActions }: StatusActionMenuProps) {
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  async function run(action: LifecycleAction) {
    try {
      await onAction(action);
      toast.success(`${name} — ${ACTION_LABELS[action].toLowerCase()}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Une erreur est survenue. Veuillez réessayer."));
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={pending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {extraActions && extraActions.length > 0 && (
            <>
              {extraActions.map((action) => (
                <DropdownMenuItem key={action.key} disabled={action.disabled} onSelect={action.onSelect}>
                  {action.icon && <action.icon />}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          {actionsFor(status).map((action) => (
            <DropdownMenuItem
              key={action}
              variant={action === "revoke" ? "destructive" : "default"}
              onSelect={() => (action === "revoke" ? setConfirmRevoke(true) : run(action))}
            >
              {ACTION_LABELS[action]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer {name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte perd immédiatement tout accès à la plateforme. Un administrateur pourra le réactiver plus
              tard si nécessaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={() => run("revoke")}>
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
