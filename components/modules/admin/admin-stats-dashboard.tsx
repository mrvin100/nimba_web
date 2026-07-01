"use client";

import type { LucideIcon } from "lucide-react";
import { Building2, Clock, FileCheck2, Folder, UserCheck, UserMinus, Users, UserX } from "lucide-react";
import { DEPARTMENT_LABELS } from "@/components/modules/identity";
import { useDossierStats, useUserStats } from "./useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DOSSIER_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE_AMORTISSEMENT: "En attente d'amortissement",
  TRADES_GENERES: "Trades générés",
};

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function SectionSkeleton({ cards }: { cards: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: cards }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

/** Admin dashboard: global platform statistics (users and credit cases). */
export function AdminStatsDashboard() {
  const users = useUserStats();
  const dossiers = useDossierStats();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de la plateforme</p>
      </div>

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
            <div className="grid gap-4 sm:grid-cols-3">
              {users.data.byDepartment.map((entry) => (
                <StatCard key={entry.department} label={DEPARTMENT_LABELS[entry.department]} value={entry.count} icon={Building2} />
              ))}
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
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total" value={dossiers.data.total} icon={Folder} />
            {dossiers.data.byStatus.map((entry) => (
              <StatCard
                key={entry.status}
                label={DOSSIER_STATUS_LABELS[entry.status] ?? entry.status}
                value={entry.count}
                icon={FileCheck2}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
