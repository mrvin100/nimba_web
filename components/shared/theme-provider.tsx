"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** App theme provider (class strategy) — light/dark/system, persisted by next-themes. */
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
