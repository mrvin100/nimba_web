"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Users } from "lucide-react";
import { ApiError, getErrorMessage } from "@/lib/api-error";
import { useImportBulkUsers, usePreviewBulkUsers } from "./useAdmin";
import { bulkTemplatePath } from "./admin-service";
import type { BulkPreviewResponse } from "./schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/**
 * Bulk account creation: download the template, drop a CSV, preview each row's
 * validity, then create (all-or-nothing). Every created account is invited.
 */
export function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkPreviewResponse | null>(null);
  const previewBulk = usePreviewBulkUsers();
  const importBulk = useImportBulkUsers();

  function reset() {
    setFile(null);
    setPreview(null);
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setPreview(null);
  }

  async function onPreview() {
    if (!file) return;
    try {
      setPreview(await previewBulk.mutateAsync(file));
    } catch (error) {
      toast.error(getErrorMessage(error, "Le fichier n'a pas pu être lu."));
    }
  }

  async function onImport() {
    if (!file) return;
    try {
      const result = await importBulk.mutateAsync(file);
      toast.success(`${result.created} compte(s) créé(s) et invité(s)`);
      setOpen(false);
      reset();
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setPreview(error.problem as unknown as BulkPreviewResponse);
        toast.error("Certaines lignes sont invalides. Corrigez le fichier.");
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users />
          Importer en masse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import en masse</DialogTitle>
          <DialogDescription>
            Téléchargez le modèle, remplissez-le, puis importez-le. Chaque compte créé recevra une invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" asChild>
            <a href={bulkTemplatePath()} download>
              <Download />
              Télécharger le modèle CSV
            </a>
          </Button>

          <div className="flex flex-wrap items-end gap-3">
            <Input type="file" accept=".csv,text/csv" onChange={onFileChange} className="max-w-sm" />
            <Button onClick={onPreview} disabled={!file || previewBulk.isPending}>
              <Upload />
              {previewBulk.isPending ? "Analyse…" : "Prévisualiser"}
            </Button>
          </div>

          {preview && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {preview.validCount} valide(s), {preview.invalidCount} en erreur.
              </p>
              <div className="max-h-80 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ligne</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Accès</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row) => (
                      <TableRow key={row.lineNumber}>
                        <TableCell>{row.lineNumber}</TableCell>
                        <TableCell>{row.fullName || "—"}</TableCell>
                        <TableCell>{row.email || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.admin ? "Admin" : [row.department, row.role].filter(Boolean).join(" · ") || "—"}
                        </TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge variant="secondary">OK</Badge>
                          ) : (
                            <span className="text-xs text-destructive">{row.errors.join(" ; ")}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button onClick={onImport} disabled={!preview?.valid || importBulk.isPending}>
            {importBulk.isPending ? "Création…" : "Créer les comptes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
