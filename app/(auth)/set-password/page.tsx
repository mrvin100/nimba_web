import { SetPasswordForm } from "@/components/modules/identity";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <SetPasswordForm token={token ?? ""} />
    </main>
  );
}
