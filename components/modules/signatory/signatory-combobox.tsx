"use client";

import { useState } from "react";
import { useSignatoryOptions } from "./useSignatory";
import { SIGNATORY_CATEGORY_LABELS, type SignatoryOption } from "./schema";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import type { Civility } from "@/components/modules/identity";

/**
 * Picks a known signatory (a profile that opted in, or an authorized standalone
 * record) and reports its live nom/titre/civilité — the caller prefills its own
 * fields with them, still editable afterward for nom/titre. The civility is
 * resolved from whichever the signatory confirmed on their profile or record, so
 * it is never retyped by hand. Never writes anything itself; this is purely a
 * convenience over retyping, the document's own fields remain the source of truth.
 */
export function SignatoryCombobox({
  onSelect,
}: Readonly<{ onSelect: (nom: string, titre: string, civility: Civility | null) => void }>) {
  const { data: options } = useSignatoryOptions();
  const [value, setValue] = useState<SignatoryOption | null>(null);

  function label(option: SignatoryOption): string {
    return `${option.nom}, ${option.titre}`;
  }

  return (
    <Combobox
      items={options ?? []}
      value={value}
      onValueChange={(option) => {
        setValue(option);
        if (option) onSelect(option.nom, option.titre, option.civility);
      }}
      itemToStringLabel={label}
      itemToStringValue={label}
    >
      <ComboboxInput placeholder="Choisir un signataire connu" className="w-56 shrink-0" />
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
