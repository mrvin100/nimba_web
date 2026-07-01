"use client";

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { AuditFilters } from "./schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const STATUS_OPTIONS = [200, 201, 204, 400, 401, 403, 404, 422, 429, 500] as const;
const ALL = "all";

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

interface AuditFiltersBarProps {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
}

/** Server-side audit filters: period (calendar range), HTTP method, HTTP status code. */
export function AuditFiltersBar({ filters, onChange }: AuditFiltersBarProps) {
  const range: DateRange | undefined = filters.from
    ? { from: parseISO(filters.from), to: filters.to ? parseISO(filters.to) : undefined }
    : undefined;

  const hasFilters = Boolean(filters.from || filters.to || filters.method || filters.status != null);

  const periodLabel = filters.from
    ? filters.to && filters.to !== filters.from
      ? `${format(parseISO(filters.from), "dd/MM/yyyy")} – ${format(parseISO(filters.to), "dd/MM/yyyy")}`
      : format(parseISO(filters.from), "dd/MM/yyyy")
    : "Période";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={filters.from ? undefined : "text-muted-foreground"}>
            <CalendarDays />
            {periodLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={fr}
            numberOfMonths={2}
            defaultMonth={range?.from}
            selected={range}
            onSelect={(next) =>
              onChange({
                ...filters,
                from: next?.from ? toIso(next.from) : undefined,
                to: next?.to ? toIso(next.to) : undefined,
              })
            }
          />
        </PopoverContent>
      </Popover>

      <Select
        value={filters.method ?? ALL}
        onValueChange={(value) => onChange({ ...filters, method: value === ALL ? undefined : value })}
      >
        <SelectTrigger size="sm" className="w-[130px]">
          <SelectValue placeholder="Méthode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes méthodes</SelectItem>
          {METHOD_OPTIONS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status != null ? String(filters.status) : ALL}
        onValueChange={(value) => onChange({ ...filters, status: value === ALL ? undefined : Number(value) })}
      >
        <SelectTrigger size="sm" className="w-[120px]">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les codes</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={String(status)}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X />
          Effacer
        </Button>
      )}
    </div>
  );
}
