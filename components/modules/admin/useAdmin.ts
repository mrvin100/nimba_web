"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  resetUserPassword,
  setUserStatus,
  updateOrganization,
  updateUserMemberships,
  uploadOrganizationLogo,
} from "./admin.service";
import type { UpdateMembershipsPayload, UserStatusAction } from "./schema";

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

/** Creates a user (invited), refreshes the list, and confirms. */
export function useCreateUser() {
  return useApiMutation({
    mutationFn: createUser,
    invalidate: [adminKeys.all],
    successToast: (created) => `Invitation envoyée à ${created.email}`,
  });
}

/** Applies a lifecycle transition and refreshes the list on success. */
export function useSetUserStatus() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: UserStatusAction }) => setUserStatus(id, action),
    invalidate: [adminKeys.all],
  });
}

/** Sends a password-reset e-mail for a managed user. */
export function useResetUserPassword() {
  return useApiMutation({
    mutationFn: resetUserPassword,
    successToast: (user) => `E-mail de réinitialisation envoyé à ${user.email}`,
    errorToast: true,
  });
}

/** Replaces a user's directions/role and admin flag; refreshes the list on success. */
export function useUpdateUserMemberships() {
  return useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMembershipsPayload }) => updateUserMemberships(id, payload),
    invalidate: [adminKeys.all],
    successToast: (user) => `Accès mis à jour pour ${user.fullName}`,
  });
}

/** Previews a bulk import CSV (no persistence); an unreadable file is toasted. */
export function usePreviewBulkUsers() {
  return useApiMutation({ mutationFn: previewBulkUsers, errorToast: true });
}

/** Commits a bulk import, refreshes the list, and reports the outcome. */
export function useImportBulkUsers() {
  return useApiMutation({
    mutationFn: importBulkUsers,
    invalidate: [adminKeys.all],
    successToast: (result) => `${result.created} compte(s) créé(s) et invité(s)`,
    errorToast: true,
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

/** Updates organisation settings, refreshes the cache, and confirms. */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: updateOrganization,
    successToast: "Paramètres enregistrés",
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}

/** Uploads the organisation logo, refreshes the cached settings, and reports the outcome. */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: uploadOrganizationLogo,
    successToast: "Logo mis à jour",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}

/** Removes the organisation logo, refreshes the cached settings, and reports the outcome. */
export function useDeleteOrganizationLogo() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: deleteOrganizationLogo,
    successToast: "Logo supprimé",
    errorToast: true,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.organization, data);
    },
  });
}
