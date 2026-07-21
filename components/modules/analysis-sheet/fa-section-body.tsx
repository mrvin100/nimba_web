"use client";

import { FaBoundSection } from "./fa-bound-section";
import { FaComputedSection } from "./fa-computed-section";
import { FaNarrativeSection } from "./fa-narrative-section";
import { FaPersonnesClesSection } from "./fa-personnes-cles-section";
import type { FaSection, ScheduleSummary } from "./schema";

/** Dispatches one section to its type-specific renderer — the only place that switches on [FaSection.type]. */
export function FaSectionBody({
  caseId,
  section,
  locked,
  taSummary,
}: Readonly<{ caseId: string; section: FaSection; locked: boolean; taSummary: ScheduleSummary | null }>) {
  switch (section.type) {
    case "NARRATIVE":
      return <FaNarrativeSection caseId={caseId} section={section} locked={locked} />;
    case "TABLE":
      if (section.key === "PILIER1_PERSONNES_CLES") {
        return <FaPersonnesClesSection caseId={caseId} section={section} locked={locked} />;
      }
      // The dedicated typed editors (tables, key-value, financial, flex, images)
      // arrive with the full-structure editor work; until then the section is
      // visible but not editable here.
      return <FaPendingEditor />;
    case "KEY_VALUE":
    case "FLEX_TABLE":
    case "FINANCIAL":
    case "IMAGE":
      return <FaPendingEditor />;
    case "COMPUTED":
      return <FaComputedSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
    case "BOUND":
      return <FaBoundSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
  }
}

function FaPendingEditor() {
  return <p className="text-sm text-muted-foreground">Éditeur dédié en cours de construction — la section est déjà exportée dans le document Word.</p>;
}
