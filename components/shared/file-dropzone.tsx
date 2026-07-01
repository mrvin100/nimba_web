"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  hint?: string;
}

/** Reusable drag-and-drop file picker with a selected-file chip. */
export function FileDropzone({ file, onFile, accept, disabled, hint }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function open() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) onFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/40",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="size-5" />
        </div>
        <p className="text-sm">
          <span className="font-medium text-foreground">Cliquez pour choisir</span> ou glissez-déposez le fichier
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </div>
      {file && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
          <span className="flex items-center gap-2 truncate">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{file.name}</span>
          </span>
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => onFile(null)} disabled={disabled}>
            <X className="size-4" />
            <span className="sr-only">Retirer le fichier</span>
          </Button>
        </div>
      )}
    </div>
  );
}
