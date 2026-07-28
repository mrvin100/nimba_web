"use client";

import { useState } from "react";
import { useSignatoryOptions } from "./useSignatory";
import { SIGNATORY_CATEGORY_LABELS, type SignatoryOption } from "./schema";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";

/**
 * Picks a known signatory (a profile that opted in, or an authorized standalone
 * record) and reports its live nom/titre — the caller prefills its own text fields
 * with them, still editable afterward. Never writes anything itself; this is purely
 * a convenience over retyping, the document's own fields remain the source of truth.
 */
export function SignatoryCombobox({ onSelect }: Readonly<{ onSelect: (nom: string, titre: string) => void }>) {
  const { data: options } = useSignatoryOptions();
  const [value, setValue] = useState<SignatoryOption | null>(null);

  return (
    <Combobox
      items={options ?? []}
      value={value}
      onValueChange={(option) => {
        setValue(option);
        if (option) onSelect(option.nom, option.titre);
      }}
      itemToStringValue={(option: SignatoryOption) => `${option.nom}, ${option.titre}`}
    >
      <ComboboxInput placeholder="Choisir un signataire connu" className="w-full" />
      <ComboboxContent>
        <ComboboxEmpty>Aucun signataire trouvé.</ComboboxEmpty>
        <ComboboxList>
          {(option: SignatoryOption) => (
            <ComboboxItem key={`${option.source}-${option.refId}`} value={option}>
              <div className="flex flex-col">
                <span>{option.nom}</span>
                <span className="text-xs text-muted-foreground">
                  {option.titre}
                  {option.category ? ` · ${SIGNATORY_CATEGORY_LABELS[option.category]}` : ""}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
