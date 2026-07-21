import { initials } from "@/lib/format";
import { DEPARTMENT_LABELS, type Department } from "@/components/modules/identity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * One color per direction, applied consistently everywhere an actor shows up
 * (review recap, workflow timeline, comment threads) — no photo is fetched (the
 * avatar endpoint only serves the caller's own picture), so the color itself is
 * the fast visual cue for "which direction did this" across a dossier's
 * back-and-forth.
 */
const DEPARTMENT_AVATAR_CLASSES: Record<Department, string> = {
  DRI: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DCM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  DRC: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMITE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function ActorAvatar({
  name,
  department,
  size = "sm",
  className,
}: Readonly<{ name: string; department: Department; size?: "sm" | "default"; className?: string }>) {
  return (
    <Avatar size={size} className={className} title={`${name} — ${DEPARTMENT_LABELS[department]}`}>
      <AvatarFallback className={cn(DEPARTMENT_AVATAR_CLASSES[department], "font-medium")}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
