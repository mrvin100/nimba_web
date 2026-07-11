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
      // Only one TABLE section exists in this proof set; the fast-follow
      // sections will add their own dedicated table renderers the same way.
      return <FaPersonnesClesSection caseId={caseId} section={section} locked={locked} />;
    case "COMPUTED":
      return <FaComputedSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
    case "BOUND":
      return <FaBoundSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
  }
}
