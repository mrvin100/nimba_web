import { AlertTriangle } from "lucide-react";
import type { ScheduleError } from "./schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Renders the parse/consistency errors from a preview or a rejected upload. */
export function ScheduleErrors({ errors }: { errors: ScheduleError[] }) {
  if (errors.length === 0) {
    return null;
  }
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>
        {errors.length} erreur{errors.length > 1 ? "s" : ""} à corriger
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          {errors.map((error, index) => (
            <li key={index}>
              {error.lineNumber != null && <span className="font-medium">Ligne {error.lineNumber} : </span>}
              {error.column && <span className="text-muted-foreground">[{error.column}] </span>}
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
