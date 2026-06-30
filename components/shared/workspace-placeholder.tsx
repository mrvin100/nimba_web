import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

/** Placeholder for a workspace whose features are not built yet (DCM, DRC stubs). */
export function WorkspacePlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>Cet espace sera disponible dans une prochaine étape.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
