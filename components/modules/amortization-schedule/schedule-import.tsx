"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Eye, Info, Settings2, Upload } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { ScheduleRejectedError } from "./amortization-schedule.service";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useGenerateTrades, usePreviewSchedule, useUploadSchedule } from "./useAmortizationSchedule";
import {
  DEFAULT_OFFSETS,
  offsetsSchema,
  type OffsetsInput,
  type PreviewResponse,
  type ScheduleError,
  type UploadResponse,
} from "./schema";
import { ScheduleErrors } from "./schedule-errors";
import { SchedulePreviewTable } from "./schedule-preview-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OFFSET_FIELDS = [
  { name: "ordinaryOffsetMonths", label: "Décalage échéance ordinaire (mois)" },
  { name: "vrOffsetMonths", label: "Décalage valeur résiduelle (mois)" },
  { name: "fixedDayOfMonth", label: "Jour fixe d'échéance" },
] as const;

/**
 * The upload workflow for a case without trades: choose a CSV, preview it (parse +
 * consistency, no persistence), import it definitively, then generate the trades.
 * Errors from both the preview (200, valid:false) and a rejected upload (422) are
 * shown in the same place.
 */
export function ScheduleImport({ caseId }: { caseId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<ScheduleError[]>([]);
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);
  const [offsets, setOffsets] = useState<OffsetsInput>(DEFAULT_OFFSETS);

  const previewMutation = usePreviewSchedule(caseId);
  const uploadMutation = useUploadSchedule(caseId);
  const generateMutation = useGenerateTrades(caseId);

  function reset() {
    setFile(null);
    setPreview(null);
    setPreviewOpen(false);
    setErrors([]);
    setUploaded(null);
  }

  function onFileSelect(next: File | null) {
    setFile(next);
    setPreview(null);
    setPreviewOpen(false);
    setErrors([]);
    setUploaded(null);
  }

  async function onPreview() {
    if (!file) return;
    try {
      const result = await previewMutation.mutateAsync(file);
      setPreview(result);
      setErrors(result.errors);
      setPreviewOpen(true);
    } catch (error) {
      setPreview(null);
      setPreviewOpen(false);
      toast.error(getErrorMessage(error, "Le fichier n'a pas pu être lu."));
    }
  }

  async function onUpload() {
    if (!file) return;
    const parsed = offsetsSchema.safeParse(offsets);
    if (!parsed.success) {
      toast.error("Paramètres de génération invalides.");
      return;
    }
    try {
      const result = await uploadMutation.mutateAsync({ file, offsets: parsed.data });
      setUploaded(result);
      setErrors([]);
      setPreviewOpen(false);
      toast.success(`Échéancier importé (version ${result.versionNumber}, ${result.lineCount} lignes)`);
    } catch (error) {
      if (error instanceof ScheduleRejectedError) {
        setErrors(error.errors);
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  }

  async function onGenerate() {
    try {
      await generateMutation.mutateAsync();
      toast.success("Trades générés");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (uploaded) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Échéancier importé</AlertTitle>
          <AlertDescription>
            Version {uploaded.versionNumber} · {uploaded.lineCount} lignes · échéance ordinaire +
            {uploaded.ordinaryOffsetMonths} mois, VR +{uploaded.vrOffsetMonths} mois, jour {uploaded.fixedDayOfMonth}.
          </AlertDescription>
        </Alert>
        <div className="flex items-center gap-2">
          <Button onClick={onGenerate} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? "Génération…" : "Générer les trades"}
          </Button>
          <Button variant="outline" onClick={reset}>
            Importer un autre fichier
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertTitle>Import de l&apos;échéancier</AlertTitle>
        <AlertDescription>
          Depuis Excel : <strong>Fichier → Enregistrer sous → CSV UTF-8 (délimité par des virgules)</strong>. La virgule
          et le point-virgule sont acceptés. L&apos;aperçu vérifie le format avant l&apos;import définitif, puis vous
          générez les trades.
        </AlertDescription>
      </Alert>

      <FileDropzone file={file} onFile={onFileSelect} accept=".csv,text/csv" hint="Fichier .csv de l'échéancier" />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onPreview} disabled={!file || previewMutation.isPending}>
          <Upload />
          {previewMutation.isPending ? "Analyse…" : "Prévisualiser"}
        </Button>
        {preview && (
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye />
            Revoir l&apos;aperçu
          </Button>
        )}
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings2 />
            Paramètres de génération
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="grid gap-3 pt-3 sm:grid-cols-3">
          {OFFSET_FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type="number"
                value={offsets[field.name]}
                onChange={(event) =>
                  setOffsets((current) => ({ ...current, [field.name]: Number(event.target.value) }))
                }
              />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {errors.length > 0 && <ScheduleErrors errors={errors} />}

      {preview && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-4 sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>Aperçu de l&apos;échéancier</DialogTitle>
              <DialogDescription>
                {preview.valid
                  ? `${preview.lines.length} ligne${preview.lines.length > 1 ? "s" : ""} · aucune erreur détectée. Vérifiez les valeurs puis importez définitivement.`
                  : `${errors.length} erreur${errors.length > 1 ? "s" : ""} à corriger avant l'import. Corrigez le fichier puis prévisualisez à nouveau.`}
              </DialogDescription>
            </DialogHeader>

            <div className="min-w-0 flex-1 space-y-4 overflow-y-auto">
              {errors.length > 0 && <ScheduleErrors errors={errors} />}
              <SchedulePreviewTable preview={preview} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fermer</Button>
              </DialogClose>
              <Button onClick={onUpload} disabled={!preview.valid || uploadMutation.isPending}>
                {uploadMutation.isPending ? "Import…" : "Importer définitivement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
