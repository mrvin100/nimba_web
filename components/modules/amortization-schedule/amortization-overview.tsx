"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { CalendarClock, ChevronsUpDown, TrendingDown } from "lucide-react";
import { formatAmount, formatDate, formatMoney } from "@/lib/format";
import { useCreditCase } from "@/components/modules/credit-case";
import { useAmortizationOverview, useAmortizationTable } from "./useAmortizationSchedule";
import type { AmortizationOverview as Overview, OverviewRange, PaymentStatus } from "./schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pager } from "@/components/shared/pager";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const chartConfig = {
  remainingCapital: { label: "Capital restant dû", color: "var(--chart-1)" },
  paidCapital: { label: "Capital remboursé", color: "var(--chart-2)" },
} satisfies ChartConfig;

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PAYE: "Payé",
  EN_COURS: "En cours",
  A_VENIR: "À venir",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={status === "PAYE" ? "default" : status === "EN_COURS" ? "secondary" : "outline"}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-1.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{children}</span>
    </div>
  );
}

/**
 * Server-computed amortization overview of a dossier: summary and current
 * situation cards, the progression chart (remaining vs repaid capital, with the
 * "today" marker), and the detailed table behind a collapsible loaded lazily.
 * The section hides itself while no schedule has been imported — every figure
 * shown comes from the backend, nothing is recomputed here.
 */
export function AmortizationOverview({ caseId }: Readonly<{ caseId: string }>) {
  const [range, setRange] = useState<OverviewRange>({});
  const { data: overview, isPending } = useAmortizationOverview(caseId, range);
  const currency = useCreditCase(caseId).data?.currency ?? "GNF";

  if (isPending) {
    // Mirror the loaded layout (two cards + chart) so nothing jumps on arrival.
    return (
      <div className="space-y-4" aria-busy>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  const money = (value: number | null | undefined) => (value == null ? "—" : formatMoney(value, currency));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Résumé du financement</CardTitle>
            <CardDescription>{overview.summary.durationMonths} échéances mensuelles + valeur résiduelle</CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryRow label="Montant financé">{money(overview.summary.loanAmount)}</SummaryRow>
            <SummaryRow label="Montant remboursé">{money(overview.summary.paidPrincipal)}</SummaryRow>
            <SummaryRow label="Capital restant">{money(overview.summary.remainingPrincipal)}</SummaryRow>
            <SummaryRow label="Durée">{overview.summary.durationMonths} mois</SummaryRow>
            <SummaryRow label="Prochaine échéance">
              {overview.summary.nextPaymentDate ? formatDate(overview.summary.nextPaymentDate) : "—"}
            </SummaryRow>
            <SummaryRow label="Montant de l'échéance">{money(overview.summary.nextPaymentAmount)}</SummaryRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" />
              Situation au {formatDate(overview.timeline.today)}
            </CardTitle>
            <CardDescription>Calculée par le backend à la date du jour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <SummaryRow label="Paiements effectués">{overview.status.completedPayments}</SummaryRow>
              <SummaryRow label="Paiements restants">{overview.status.remainingPayments}</SummaryRow>
              <SummaryRow label="Intérêts cumulés">{money(overview.summary.interestPaid)}</SummaryRow>
              <SummaryRow label="Capital restant">{money(overview.summary.remainingPrincipal)}</SummaryRow>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium tabular-nums">{overview.status.completion} %</span>
              </div>
              <Progress value={Math.min(100, overview.status.completion)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="size-4" />
                Progression du capital
              </CardTitle>
              <CardDescription>
                Période {overview.timeline.currentPeriod} sur{" "}
                {overview.timeline.currentPeriod + overview.timeline.remainingPeriods}
              </CardDescription>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="overview-from" className="text-xs">
                  Du
                </Label>
                <Input
                  id="overview-from"
                  type="date"
                  className="h-8 w-36"
                  value={range.from ?? ""}
                  onChange={(event) => setRange((r) => ({ ...r, from: event.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="overview-to" className="text-xs">
                  Au
                </Label>
                <Input
                  id="overview-to"
                  type="date"
                  className="h-8 w-36"
                  value={range.to ?? ""}
                  onChange={(event) => setRange((r) => ({ ...r, to: event.target.value || undefined }))}
                />
              </div>
              {(range.from || range.to) && (
                <Button variant="ghost" size="sm" onClick={() => setRange({})}>
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <LineChart data={overview.chart} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value: number) => formatAmount(value / 1_000_000) + " M"}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as Overview["chart"][number] | undefined;
                      if (!point) return null;
                      return `Période ${point.period}${point.date ? ` · ${formatDate(point.date)}` : ""} · ${point.paidPercentage} % remboursé`;
                    }}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="font-medium tabular-nums">{money(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <ReferenceLine
                x={overview.timeline.currentPeriod}
                stroke="var(--foreground)"
                strokeDasharray="4 4"
                label={{ value: "Aujourd'hui", position: "top", fontSize: 11 }}
              />
              <Line
                dataKey="remainingCapital"
                type="monotone"
                stroke="var(--color-remainingCapital)"
                strokeWidth={2}
                dot={false}
              />
              <Line dataKey="paidCapital" type="monotone" stroke="var(--color-paidCapital)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <AmortizationTableSection caseId={caseId} currency={currency} />
    </div>
  );
}

/** Detailed table, fetched ONLY once the user expands the section (lazy). */
function AmortizationTableSection({ caseId, currency }: Readonly<{ caseId: string; currency: string }>) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const size = 25;
  const { data, isPending } = useAmortizationTable(caseId, { page, size, status }, open);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
              <span className="text-base font-semibold">Voir le tableau d&apos;amortissement</span>
              <ChevronsUpDown className="size-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Select
                value={status ?? "ALL"}
                onValueChange={(value) => {
                  setStatus(value === "ALL" ? undefined : (value as PaymentStatus));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-44" size="sm">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  {(Object.keys(STATUS_LABELS) as PaymentStatus[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isPending || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Capital</TableHead>
                        <TableHead className="text-right">Intérêts</TableHead>
                        <TableHead className="text-right">Mensualité</TableHead>
                        <TableHead className="text-right">Capital restant</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.content.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-16 text-center text-muted-foreground">
                            Aucune échéance pour ce filtre.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.content.map((row) => (
                          <TableRow key={row.period}>
                            <TableCell className="font-medium">{row.period}</TableCell>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(row.capital)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(row.interet)}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatAmount(row.mensualite)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {row.capitalRestantDu == null ? "—" : formatAmount(row.capitalRestantDu)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={row.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <Pager
                  hasPrevious={data.hasPrevious}
                  hasNext={data.hasNext}
                  onPrevious={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                  label={`${data.totalElements} échéance${data.totalElements > 1 ? "s" : ""} · ${currency} · page ${data.page + 1}/${Math.max(1, data.totalPages)}`}
                />
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
