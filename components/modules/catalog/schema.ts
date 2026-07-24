/** The two dossier lifecycle archetypes (mirrors the backend `LifecycleKind`). */
export type LifecycleKind = "FINANCEMENT" | "ENGAGEMENT";

/** A credit product family (mirrors the backend `ProductFamily`). */
export type ProductFamily = "LEASING" | "MC2_MUFFA" | "CAUTION";

/**
 * One product in the catalogue — the system-wide list of credit products and their
 * registres, from GET /catalog/products. The frontend keys registres and navigation
 * off [family] rather than hardcoding the product list.
 */
export interface ProductDescriptor {
  family: ProductFamily;
  label: string;
  /** Direction code that pilots the product's registre. */
  department: string;
  lifecycle: LifecycleKind;
}
