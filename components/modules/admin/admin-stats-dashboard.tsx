"use client";

import type { LucideIcon } from "lucide-react";
import { Building2, Clock, FileCheck2, Folder, UserCheck, UserMinus, Users, UserX } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { useDossierStats, useUserStats } from "./useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const DOSSIER_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE_AMORTISSEMENT: "En attente d'amortissement",
  TRADES_GENERES: "Trades générés",
};

const departmentChartConfig = {
  count: { label: "Utilisateurs", color: "var(--chart-1)" },
} satisfies ChartConfig;

const statusChartConfig = {
  active: { label: "Actifs", color: "var(--chart-1)" },
  pending: { label: "En attente", color: "var(--chart-2)" },
  suspended: { label: "Suspendus", color: "var(--chart-3)" },
  revoked: { label: "Révoqués", color: "var(--chart-4)" },
} satisfies ChartConfig;

const dossierChartConfig = {
  count: { label: "Dossiers", color: "var(--chart-1)" },
} satisfies ChartConfig;

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionSkeleton({ cards }: { cards: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: cards }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  );
}

/** Admin dashboard: KPI summary and charts for users and credit cases. */
export function AdminStatsDashboard() {
  const users = useUserStats();
  const dossiers = useDossierStats();

  const statusData = users.data
    ? [
        { status: "active", value: users.data.active, fill: "var(--color-active)" },
        { status: "pending", value: users.data.pending, fill: "var(--color-pending)" },
        { status: "suspended", value: users.data.suspended, fill: "var(--color-suspended)" },
        { status: "revoked", value: users.data.revoked, fill: "var(--color-revoked)" },
      ].filter((entry) => entry.value > 0)
    : [];

  const departmentData =
    users.data?.byDepartment.map((entry) => ({
      department: DEPARTMENT_LABELS[entry.department],
      count: entry.count,
    })) ?? [];

  const dossierData =
    dossiers.data?.byStatus.map((entry) => ({
      status: DOSSIER_STATUS_LABELS[entry.status] ?? entry.status,
      count: entry.count,
    })) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de la plateforme" />

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Utilisateurs</h2>
        {users.isPending ? (
          <SectionSkeleton cards={5} />
        ) : users.isError || !users.data ? (
          <p className="text-sm text-destructive">Impossible de charger les statistiques utilisateurs.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Total" value={users.data.total} icon={Users} />
              <StatCard label="Actifs" value={users.data.active} icon={UserCheck} />
              <StatCard label="En attente" value={users.data.pending} icon={Clock} />
              <StatCard label="Suspendus" value={users.data.suspended} icon={UserMinus} />
              <StatCard label="Révoqués" value={users.data.revoked} icon={UserX} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4" />
                    Répartition par direction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {departmentData.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée.</p>
                  ) : (
                    <ChartContainer config={departmentChartConfig} className="h-56 w-full">
                      <BarChart data={departmentData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="department" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-4" />
                    Statuts des comptes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée.</p>
                  ) : (
                    <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-56">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                        <Pie data={statusData} dataKey="value" nameKey="status" innerRadius={55} strokeWidth={4}>
                          {statusData.map((entry) => (
                            <Cell key={entry.status} fill={entry.fill} />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                    {users.data.total}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                                    comptes
                                  </tspan>
                                </text>
                              );
                            }}
                          />
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Dossiers</h2>
        {dossiers.isPending ? (
          <SectionSkeleton cards={3} />
        ) : dossiers.isError || !dossiers.data ? (
          <p className="text-sm text-destructive">Impossible de charger les statistiques dossiers.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard label="Total" value={dossiers.data.total} icon={Folder} />
            {dossiers.data.byStatus.map((entry) => (
              <StatCard
                key={entry.status}
                label={DOSSIER_STATUS_LABELS[entry.status] ?? entry.status}
                value={entry.count}
                icon={FileCheck2}
              />
            ))}

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Dossiers par statut</CardTitle>
              </CardHeader>
              <CardContent>
                {dossierData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Aucun dossier pour le moment.</p>
                ) : (
                  <ChartContainer config={dossierChartConfig} className="h-40 w-full">
                    <BarChart data={dossierData} layout="vertical" margin={{ left: 16 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} width={170} />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
