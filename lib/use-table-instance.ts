import { useReactTable, type Table, type TableOptions } from "@tanstack/react-table";

/**
 * Thin wrapper around `useReactTable` that lives in its own file so the
 * consumer (DataTable) never triggers the `react-hooks/incompatible-library`
 * rule. The `"use no memo"` directive tells the React Compiler to skip
 * auto-memoizing this hook.
 *
 * The `react-hooks/incompatible-library` rule is disabled for this file in
 * eslint.config.mjs because the opt-out is intentional.
 */
export function useTableInstance<TData>(
  options: TableOptions<TData>,
): Table<TData> {
  "use no memo";
  return useReactTable(options);
}
