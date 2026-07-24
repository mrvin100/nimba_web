"use client";

import { useQuery } from "@tanstack/react-query";
import { listProducts } from "./catalog.service";

/**
 * The product catalogue. Backend reference data that only changes with a deploy, so
 * it is fetched once and kept fresh for the session (like the case-type registry).
 */
export function useProducts() {
  return useQuery({
    queryKey: ["catalog", "products"],
    queryFn: listProducts,
    staleTime: Infinity,
  });
}
