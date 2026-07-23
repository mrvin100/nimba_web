import { PageHeader } from "@/components/shared/page-header";
import { CautionList } from "./caution-list";

/**
 * Registre en lecture seule de tous les documents générés (cautions,
 * attestations…), tous dossiers confondus : recherche, statut, téléchargement.
 * La création se fait désormais uniquement depuis un dossier de caution.
 */
export function CautionsView() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <PageHeader
        title="Cautions"
        description="Registre de tous les documents générés. Pour en créer, ouvrez un dossier de caution."
      />
      <CautionList />
    </div>
  );
}
