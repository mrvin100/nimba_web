"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { useUpdateClientMatricule } from "./useClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The matricule, read-only for most users — a direction manager (DRI or DCM,
 * either) may correct a data-entry mistake through a separate, more tightly
 * gated mutation than the rest of the fiche (see UpdateClientMatriculeCommand).
 */
export function MatriculeField({ clientId, matricule }: Readonly<{ clientId: string; matricule: string | null }>) {
  const session = useSession();
  const canEdit = session.isManager("DRI") || session.isManager("DCM");
  const update = useUpdateClientMatricule(clientId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(matricule ?? "");

  if (!canEdit) {
    return <p className="text-sm text-muted-foreground">{matricule ? `Matricule ${matricule}` : "Matricule non renseigné"}</p>;
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1">
        <p className="text-sm text-muted-foreground">{matricule ? `Matricule ${matricule}` : "Matricule non renseigné"}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => {
            setValue(matricule ?? "");
            setEditing(true);
          }}
        >
          <Pencil className="size-3" />
          <span className="sr-only">Corriger le matricule</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Matricule"
        className="h-8 max-w-40"
        autoFocus
      />
      <Button
        type="button"
        size="sm"
        disabled={update.isPending}
        onClick={() => update.mutate(value.trim(), { onSuccess: () => setEditing(false) })}
      >
        Enregistrer
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
        Annuler
      </Button>
    </div>
  );
}
