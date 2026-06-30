"use client";

import { Button } from "@/components/ui/button";

interface PagerProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/** Previous / next pager for backend-paginated tables (shared across modules). */
export function Pager({ hasPrevious, hasNext, onPrevious, onNext }: PagerProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={onPrevious}>
        Précédent
      </Button>
      <Button variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
        Suivant
      </Button>
    </div>
  );
}
