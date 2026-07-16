"use client";

import { File, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { useSession } from "@/components/modules/identity";
import { formatBytes, formatDate } from "@/lib/format";
import { AddAttachmentDialog } from "./add-attachment-dialog";
import { guaranteeAttachmentDownloadPath } from "./guarantee.service";
import { useDeleteGuaranteeAttachment } from "./useGuarantee";
import type { Guarantee, GuaranteeAttachment } from "./schema";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";

function iconFor(contentType: string) {
  if (contentType.startsWith("image/")) return <ImageIcon />;
  if (contentType === "application/pdf") return <FileText />;
  return <File />;
}

function AttachmentItem({
  caseId,
  guaranteeId,
  attachment,
  canEdit,
}: Readonly<{ caseId: string; guaranteeId: string; attachment: GuaranteeAttachment; canEdit: boolean }>) {
  const removeAttachment = useDeleteGuaranteeAttachment(caseId);
  const href = guaranteeAttachmentDownloadPath(caseId, guaranteeId, attachment.id);

  return (
    <Attachment size="sm">
      <AttachmentMedia>{iconFor(attachment.contentType)}</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{attachment.fileName}</AttachmentTitle>
        <AttachmentDescription>
          {formatBytes(attachment.sizeBytes)} · {formatDate(attachment.uploadedAt)}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        {canEdit && (
          <AttachmentAction
            aria-label={`Supprimer ${attachment.fileName}`}
            disabled={removeAttachment.isPending}
            onClick={() => removeAttachment.mutate({ guaranteeId, attachmentId: attachment.id })}
          >
            <Trash2 />
          </AttachmentAction>
        )}
      </AttachmentActions>
      <AttachmentTrigger asChild>
        <a href={href} target="_blank" rel="noreferrer" aria-label={`Ouvrir ${attachment.fileName}`} />
      </AttachmentTrigger>
    </Attachment>
  );
}

/** A guarantee's proof files: an official shadcn Attachment/AttachmentGroup list, with an add action for the DRI. */
export function GuaranteeAttachments({ caseId, guarantee }: Readonly<{ caseId: string; guarantee: Guarantee }>) {
  const session = useSession();
  const canEdit = session.hasDepartment("DRI");

  return (
    <div className="flex items-center gap-2">
      {guarantee.attachments.length > 0 && (
        <AttachmentGroup>
          {guarantee.attachments.map((attachment) => (
            <AttachmentItem key={attachment.id} caseId={caseId} guaranteeId={guarantee.id} attachment={attachment} canEdit={canEdit} />
          ))}
        </AttachmentGroup>
      )}
      {canEdit && <AddAttachmentDialog caseId={caseId} guaranteeId={guarantee.id} />}
    </div>
  );
}
