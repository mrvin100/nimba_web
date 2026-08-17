"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface BreadcrumbRecordContextValue {
  label: string | null;
  setLabel: (label: string | null) => void;
}

const BreadcrumbRecordContext = createContext<BreadcrumbRecordContextValue | null>(null);

/** Wraps the authenticated shell so a detail page can register its record's name as the breadcrumb's final crumb. */
export function BreadcrumbRecordProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [label, setLabel] = useState<string | null>(null);
  return <BreadcrumbRecordContext.Provider value={{ label, setLabel }}>{children}</BreadcrumbRecordContext.Provider>;
}

/**
 * Registers the current page's record name (e.g. a client's raison sociale, a
 * caution's reference number) as the breadcrumb's final, non-clickable crumb.
 * Cleared on unmount so navigating away never leaves a stale label behind for
 * the next page.
 */
export function useBreadcrumbRecord(label: string | undefined) {
  const context = useContext(BreadcrumbRecordContext);
  useEffect(() => {
    context?.setLabel(label ?? null);
    return () => context?.setLabel(null);
  }, [context, label]);
}

/** The shell's own read side — the currently registered record label, if any. */
export function useBreadcrumbRecordValue(): string | null {
  return useContext(BreadcrumbRecordContext)?.label ?? null;
}
