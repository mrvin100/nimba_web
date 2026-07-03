"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  /** The form's state (pass `form.formState` or the destructured flags). */
  formState: { isSubmitting: boolean; isDirty?: boolean };
  /** Also require the form to be dirty (edit forms: nothing to save otherwise). */
  requireDirty?: boolean;
  /** Label shown while the submission is in flight. */
  pendingLabel?: string;
}

/**
 * The one submit button for every form: disabled while submitting (prevents
 * double-submission / API abuse) and — when `requireDirty` — until the user
 * actually changed something. Shows a spinner during the round trip.
 */
export function SubmitButton({
  formState,
  requireDirty = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { isSubmitting, isDirty } = formState;
  return (
    <Button type="submit" disabled={disabled || isSubmitting || (requireDirty && !isDirty)} {...props}>
      {isSubmitting && <Spinner className="size-4" />}
      {isSubmitting && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
