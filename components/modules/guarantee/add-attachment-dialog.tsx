"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { getErrorMessage } from "@/lib/api-error";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useUploadGuaranteeAttachment } from "./useGuarantee";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";

/** Uploads one proof file to a guarantee. */
export function AddAttachmentDialog({ caseId, guaranteeId }: Readonly<{ caseId: string; guaranteeId: string }>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadGuaranteeAttachment(caseId);

  function onOpenChange(next: boolean) {
    if (next) {
      setFile(null);
      setError(null);
    }
    setOpen(next);
  }

  function onSubmit() {
    if (!file) return;
    setError(null);
    upload.mutate(
      { guaranteeId, file },
      {
        onSuccess: () => setOpen(false),
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Ajouter une pièce jointe">
          <Paperclip />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une pièce jointe</DialogTitle>
          <DialogDescription>Lettre de domiciliation signée, carte grise, certificat foncier…</DialogDescription>
        </DialogHeader>
        <FileDropzone file={file} onFile={setFile} disabled={upload.isPending} />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={!file || upload.isPending}>
            {upload.isPending && <Spinner className="size-4" />}
            {upload.isPending ? "Envoi…" : "Téléverser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
