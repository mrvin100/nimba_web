import type { PreviewResponse } from "./schema";
import { formatAmount, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLUMNS = [
  "N°",
  "Date",
  "Intérêt",
  "Équipement",
  "Assurance",
  "Tracking",
  "Immat.",
  "Capital",
  "Loyer HT",
  "Taxes",
  "Loyer TTC",
  "CRD",
] as const;

/** Read-only preview of the parsed schedule (raw values), horizontally scrollable. */
export function SchedulePreviewTable({ preview }: { preview: PreviewResponse }) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((label) => (
                <TableHead key={label} className="whitespace-nowrap">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.lines.map((line) => (
              <TableRow key={line.lineNumber}>
                <TableCell className="whitespace-nowrap font-medium">
                  {line.numeroEcheance}
                  {line.residualValue && (
                    <Badge variant="secondary" className="ml-2">
                      VR
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(line.dateEcheance)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.interet)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.equipement)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.assurance)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.tracking)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.immatriculation)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.capital)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.loyerHt)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.taxes)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAmount(line.loyerTtc)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {line.capitalRestantDu == null ? "—" : formatAmount(line.capitalRestantDu)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-right text-sm text-muted-foreground">
        Total loyers TTC (hors VR) :{" "}
        <span className="font-medium text-foreground tabular-nums">{formatAmount(preview.totalLoyerTtcExcludingVr)}</span>
      </p>
    </div>
  );
}
