"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Info, Upload, Users } from "lucide-react";
import { ApiError, getErrorMessage } from "@/lib/api-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useImportBulkUsers, usePreviewBulkUsers } from "./useAdmin";
import { bulkTemplatePath } from "./admin-service";
import type { BulkPreviewResponse } from "./schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  function onFileSelect(next: File | null) {
    setFile(next);
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
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import en masse</DialogTitle>
          <DialogDescription>Créez plusieurs comptes à partir d&apos;un fichier CSV.</DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <Alert>
            <Info />
            <AlertTitle>Comment procéder</AlertTitle>
            <AlertDescription>
              Une ligne par utilisateur — colonnes <code>fullName, email, department, role, admin</code>. Laissez
              direction/rôle vides pour un administrateur. Depuis Excel, enregistrez en{" "}
              <strong>CSV UTF-8</strong> (virgule ou point-virgule acceptés). Chaque compte créé reçoit une invitation.
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={bulkTemplatePath()} download>
                    <Download />
                    Télécharger le modèle CSV
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <FileDropzone file={file} onFile={onFileSelect} accept=".csv,text/csv" hint="Fichier .csv (max 2 Mo)" />

          <Button onClick={onPreview} disabled={!file || previewBulk.isPending}>
            <Upload />
            {previewBulk.isPending ? "Analyse…" : "Prévisualiser"}
          </Button>

          {preview && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {preview.validCount} valide(s), {preview.invalidCount} en erreur.
              </p>
              <div className="max-h-72 overflow-auto rounded-md border">
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
