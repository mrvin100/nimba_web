"use client";

import { Button } from "@/components/ui/button";

interface PagerProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** Context shown on the left (e.g. "25 dossiers · page 1/2"). */
  label?: string;
}

/** Previous / next pager for backend-paginated tables (shared across modules). */
export function Pager({ hasPrevious, hasNext, onPrevious, onNext, label }: PagerProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
          Précédent
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
