/**
 * The "*" that flags a required field in the caution forms, giving a quick,
 * intuitive visual cue. The asterisk is decorative; screen readers hear
 * "(obligatoire)" instead, and the input itself carries `aria-required`.
 */
export function RequiredMark() {
  return (
    <span className="text-destructive">
      <span aria-hidden="true"> *</span>
      <span className="sr-only"> (obligatoire)</span>
    </span>
  );
}
