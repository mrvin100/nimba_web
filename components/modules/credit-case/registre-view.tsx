"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/components/modules/catalog";
import { Pager } from "@/components/shared/pager";
import { caseDetailPath } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useProductRegistre } from "./useCreditCase";
import type { ProductType } from "./schema";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Per-product registre: the dossiers of one financement product family, chosen from
 * the catalogue (GET /catalog/products) rather than a hardcoded list. Adding a
 * financement product to the catalogue makes it appear here with no code change.
 */
export function RegistreView({ workspaceBase }: Readonly<{ workspaceBase: string }>) {
  const { data: products } = useProducts();
  const families = (products ?? []).filter((product) => product.lifecycle === "FINANCEMENT");
  const [family, setFamily] = useState<ProductType>("LEASING");
  const [page, setPage] = useState(0);
  const { data, isPending } = useProductRegistre(family, page, 20);

  function onFamilyChange(value: string) {
    setFamily(value as ProductType);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <Select value={family} onValueChange={onFamilyChange}>
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Choisir un registre" />
        </SelectTrigger>
        <SelectContent>
          {families.map((product) => (
            <SelectItem key={product.family} value={product.family}>
              Registre — {product.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="pt-6">
          {isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : (data?.content.length ?? 0) === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucun dossier dans ce registre.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° dossier</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.content.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell>
                      <Link className="font-medium underline-offset-4 hover:underline" href={caseDetailPath(dossier.id, workspaceBase)}>
                        {dossier.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{dossier.clientName}</TableCell>
                    <TableCell>{dossier.status}</TableCell>
                    <TableCell>{formatDate(dossier.createdAt)}</TableCell>
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
        label={data ? `${data.totalElements} dossier(s)` : undefined}
      />
    </div>
  );
}
