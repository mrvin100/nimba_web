"use client";

import { useState } from "react";
import Link from "next/link";
import { useClients } from "@/components/modules/client";
import { Pager } from "@/components/shared/pager";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * The client registry — every bank client, the entry point to a client's 360 view.
 * Shared by the DRI and DCM workspaces (both transact with clients); [workspaceBase]
 * scopes the links to the current workspace.
 */
export function ClientsRegistryView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  const [page, setPage] = useState(0);
  const { data, isPending } = useClients(page, 20);

  if (isPending) return <Skeleton className="h-64 w-full" />;

  const clients = data?.content ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {clients.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucun client enregistré.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raison sociale</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Agence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link className="font-medium underline-offset-4 hover:underline" href={`${workspaceBase}/clients/${client.id}`}>
                        {client.raisonSociale}
                      </Link>
                    </TableCell>
                    <TableCell>{client.matricule ?? "—"}</TableCell>
                    <TableCell>{client.agence ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Pager
        hasPrevious={page > 0}
        hasNext={data?.hasNext ?? false}
        onPrevious={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        label={data ? `${data.totalElements} client(s)` : undefined}
      />
    </div>
  );
}
