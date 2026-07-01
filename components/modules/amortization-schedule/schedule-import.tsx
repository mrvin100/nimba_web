"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Info, Settings2, Upload } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useGenerateTrades, usePreviewSchedule, useUploadSchedule } from "./useAmortizationSchedule";
import {
  DEFAULT_OFFSETS,
  offsetsSchema,
  scheduleErrorsFrom,
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
  const [errors, setErrors] = useState<ScheduleError[]>([]);
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);
  const [offsets, setOffsets] = useState<OffsetsInput>(DEFAULT_OFFSETS);

  const previewMutation = usePreviewSchedule(caseId);
  const uploadMutation = useUploadSchedule(caseId);
  const generateMutation = useGenerateTrades(caseId);

  function reset() {
    setFile(null);
    setPreview(null);
    setErrors([]);
    setUploaded(null);
  }

  function onFileSelect(next: File | null) {
    setFile(next);
    setPreview(null);
    setErrors([]);
    setUploaded(null);
  }

  async function onPreview() {
    if (!file) return;
    try {
      const result = await previewMutation.mutateAsync(file);
      setPreview(result);
      setErrors(result.errors);
    } catch (error) {
      setPreview(null);
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
      toast.success(`Échéancier importé (version ${result.versionNumber}, ${result.lineCount} lignes)`);
    } catch (error) {
      const rejected = scheduleErrorsFrom(error);
      if (rejected) {
        setErrors(rejected);
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
          Déposez le fichier CSV de l&apos;échéancier. L&apos;aperçu vérifie le format avant l&apos;import définitif, puis
          vous générez les trades.
        </AlertDescription>
      </Alert>

      <FileDropzone file={file} onFile={onFileSelect} accept=".csv,text/csv" hint="Fichier .csv de l'échéancier" />

      <Button onClick={onPreview} disabled={!file || previewMutation.isPending}>
        <Upload />
        {previewMutation.isPending ? "Analyse…" : "Prévisualiser"}
      </Button>

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
        <div className="space-y-4">
          <SchedulePreviewTable preview={preview} />
          <Button onClick={onUpload} disabled={!preview.valid || uploadMutation.isPending}>
            {uploadMutation.isPending ? "Import…" : "Importer définitivement"}
          </Button>
        </div>
      )}
    </div>
  );
}
