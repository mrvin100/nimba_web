"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import type { Trade } from "./schema";
import { formatDate, formatMoney } from "@/lib/format";
import { tradesDocxExportPath, tradesExportPath } from "./amortization-schedule.service";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tradeColumns: ColumnDef<Trade>[] = [
  {
    accessorKey: "numeroEcheance",
    header: "N° échéance",
    cell: ({ row }) => <span className="font-medium">{row.original.numeroEcheance}</span>,
  },
  {
    accessorKey: "dueDate",
    header: "Échéance",
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => <span className="tabular-nums">{formatMoney(row.original.amount, row.original.currency)}</span>,
  },
  {
    accessorKey: "amountInWords",
    header: "Montant en lettres",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.amountInWords}</span>,
  },
];

/** Today's date in the ISO form a `<input type="date">` expects (local time). */
function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** The generated trades plus the export actions (Word with its signature date, CSV). */
export function TradesTable({ caseId, trades }: { caseId: string; trades: Trade[] }) {
  // Printed on every traité's acceptance line; pre-filled with the download day
  // so the common case needs no interaction. Cleared, the backend applies the
  // same default server-side.
  const [signatureDate, setSignatureDate] = useState(todayIso);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {trades.length} trade{trades.length > 1 ? "s" : ""} généré{trades.length > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="signature-date" className="text-xs text-muted-foreground">
              Date de signature des traités
            </Label>
            <Input
              id="signature-date"
              type="date"
              className="h-8 w-40"
              value={signatureDate}
              onChange={(event) => setSignatureDate(event.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={tradesDocxExportPath(caseId, signatureDate || undefined)} download>
              <FileText />
              Traités (Word)
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={tradesExportPath(caseId)} download>
              <Download />
              CSV
            </a>
          </Button>
        </div>
      </div>
      <DataTable columns={tradeColumns} data={trades} emptyMessage="Aucun trade." />
    </div>
  );
}
