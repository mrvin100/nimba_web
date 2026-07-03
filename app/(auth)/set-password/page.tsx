import { SetPasswordForm } from "@/components/modules/identity";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <SetPasswordForm token={token ?? ""} />;
}
