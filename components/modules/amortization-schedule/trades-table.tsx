"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import type { Trade } from "./schema";
import { formatDate, formatMoney } from "@/lib/format";
import { tradesExportPath } from "./amortization-service";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";

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

/** The generated trades plus the CSV export action. */
export function TradesTable({ caseId, trades }: { caseId: string; trades: Trade[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {trades.length} trade{trades.length > 1 ? "s" : ""} généré{trades.length > 1 ? "s" : ""}
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href={tradesExportPath(caseId)} download>
            <Download />
            Exporter en CSV
          </a>
        </Button>
      </div>
      <DataTable columns={tradeColumns} data={trades} emptyMessage="Aucun trade." />
    </div>
  );
}
