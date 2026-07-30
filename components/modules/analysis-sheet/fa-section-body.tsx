"use client";

import { FaBoundSection } from "./fa-bound-section";
import { FaComputedSection } from "./fa-computed-section";
import { FaFinancialSection } from "./fa-financial-section";
import { FaFlexTableSection } from "./fa-flex-table-section";
import { FaImageSection } from "./fa-image-section";
import { FaKeyValueSection } from "./fa-key-value-section";
import { FaNarrativeSection } from "./fa-narrative-section";
import { FaTableSection } from "./fa-table-section";
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
      return <FaTableSection caseId={caseId} section={section} locked={locked} />;
    case "KEY_VALUE":
      return <FaKeyValueSection caseId={caseId} section={section} locked={locked} />;
    case "FLEX_TABLE":
      return <FaFlexTableSection caseId={caseId} section={section} locked={locked} />;
    case "FINANCIAL":
      return <FaFinancialSection caseId={caseId} section={section} locked={locked} />;
    case "IMAGE":
      return <FaImageSection caseId={caseId} section={section} locked={locked} />;
    case "COMPUTED":
      return <FaComputedSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
    case "BOUND":
      return <FaBoundSection caseId={caseId} sectionKey={section.key} taSummary={taSummary} />;
  }
}
