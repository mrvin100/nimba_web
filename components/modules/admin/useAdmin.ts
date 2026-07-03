"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/mutation";
import { queryKeys } from "@/lib/query-keys";
import {
  createUser,
  deleteOrganizationLogo,
  getDossierStats,
  getOrganization,
  getUserStats,
  importBulkUsers,
  listUsers,
  previewBulkUsers,
  setUserStatus,
  updateOrganization,
  uploadOrganizationLogo,
} from "./admin.service";
import type { UserStatusAction } from "./schema";

/** Query keys for the admin domain (single source for cache invalidation). */
export const adminKeys = {
  ...queryKeys("admin-users"),
  organization: ["admin-organization"] as const,
  userStats: ["admin-stats", "users"] as const,
  dossierStats: ["admin-stats", "dossiers"] as const,
};

/** Paginated list of managed users (server state). */
export function useAdminUsers(page: number, size = 20) {
  return useQuery({
    queryKey: adminKeys.list(page, size),
    queryFn: () => listUsers(page, size),
  });
}

/** Creates a user and refreshes the list on success. */
export function useCreateUser() {
  return useApiMutation({
    mutationFn: createUser,
    invalidate: [adminKeys.all],
  });
}

/** Applies a lifecycle transition and refreshes the list on success. */
export function useSetUserStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: UserStatusAction }) => setUserStatus(id, action),
    invalidate: [adminKeys.all],
  });
}

/** Previews a bulk import CSV (no persistence). */
export function usePreviewBulkUsers() {
  return useMutation({ mutationFn: previewBulkUsers });
}

/** Commits a bulk import and refreshes the list on success. */
export function useImportBulkUsers() {
  return useApiMutation({
    mutationFn: importBulkUsers,
    invalidate: [adminKeys.all],
  });
}

/** Aggregate user counts for the admin dashboard (server state). */
export function useUserStats() {
  return useQuery({
    queryKey: adminKeys.userStats,
    queryFn: getUserStats,
  });
}

/** Aggregate credit-case counts for the admin dashboard (server state). */
export function useDossierStats() {
  return useQuery({
    queryKey: adminKeys.dossierStats,
    queryFn: getDossierStats,
  });
}

/** Organisation settings (server state). */
export function useOrganization() {
  return useQuery({
    queryKey: adminKeys.organization,
    queryFn: getOrganization,
  });
}

/** Updates organisation settings and refreshes the cache. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}

/** Uploads the organisation logo and refreshes the cached settings. */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadOrganizationLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}

/** Removes the organisation logo and refreshes the cached settings. */
export function useDeleteOrganizationLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrganizationLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}
