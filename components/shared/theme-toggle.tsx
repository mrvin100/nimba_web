"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

/** Segmented light / dark / system theme selector. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex gap-1 rounded-md border p-1">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={theme === option.value ? "secondary" : "ghost"}
          onClick={() => setTheme(option.value)}
        >
          <option.icon className="size-4" />
          {option.label}
        </Button>
      ))}
    </div>
  );
}
