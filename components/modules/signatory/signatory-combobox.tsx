"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useSignatoryOptions } from "./useSignatory";
import { SIGNATORY_CATEGORY_LABELS, type SignatoryOption } from "./schema";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function optionLabel(option: SignatoryOption): string {
  const category = option.category ? ` (${SIGNATORY_CATEGORY_LABELS[option.category]})` : "";
  return `${option.nom}, ${option.titre}${category}`;
}

/**
 * Picks a known signatory (a profile that opted in, or an authorized standalone
 * record) and reports its live nom/titre — the caller prefills its own text fields
 * with them, still editable afterward. Never writes anything itself; this is purely
 * a convenience over retyping, the document's own fields remain the source of truth.
 */
export function SignatoryCombobox({ onSelect }: Readonly<{ onSelect: (nom: string, titre: string) => void }>) {
  const { data: options, isPending } = useSignatoryOptions();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {isPending ? "Chargement…" : "Choisir un signataire connu"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un signataire…" />
          <CommandList>
            <CommandEmpty>Aucun signataire trouvé.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={`${option.source}-${option.refId}`}
                  value={optionLabel(option)}
                  onSelect={() => {
                    onSelect(option.nom, option.titre);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{option.nom}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.titre}
                      {option.category ? ` · ${SIGNATORY_CATEGORY_LABELS[option.category]}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
