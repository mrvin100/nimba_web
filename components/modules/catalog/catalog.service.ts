import { api } from "@/lib/api-client";
import type { ProductDescriptor } from "./schema";

/** Every credit product in the catalogue (drives per-product registres and navigation). */
export function listProducts(): Promise<ProductDescriptor[]> {
  return api.get("catalog/products").json<ProductDescriptor[]>();
}
