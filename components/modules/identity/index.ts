export { LoginForm } from "./login-form";
export { BootstrapForm } from "./bootstrap-form";
export { SetPasswordForm } from "./set-password-form";
export { ProfileView } from "./profile-view";
export { GuestOnly } from "./guest-only";
export {
  useSession,
  useLogin,
  useLogout,
  useBootstrapStatus,
  useBootstrap,
  useInvitation,
  useSetPassword,
  useUpdateProfile,
  useOrganizationName,
  identityKeys,
} from "./useIdentity";
export {
  useUploadAvatar,
  useDeleteAvatar,
} from "./useIdentity";
// Only URL builders cross the module boundary — API calls stay behind the hooks.
export { avatarPath, publicOrganizationLogoPath } from "./identity.service";
export { loginSchema, DEPARTMENTS, DEPARTMENT_ROLES, DEPARTMENT_LABELS } from "./schema";
export type {
  LoginInput,
  MeResponse,
  Department,
  DepartmentRole,
  AccountStatus,
  Membership,
  BootstrapInput,
  SetPasswordInput,
  InvitationInfo,
} from "./schema";
export {
  isAdmin,
  isManager,
  hasDepartment,
  userDepartments,
  primaryDepartment,
  departmentPath,
  landingPath,
} from "./auth-access";
