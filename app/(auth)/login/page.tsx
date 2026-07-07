import { LoginForm } from "@/components/modules/identity";
import { ServiceWakeNotice } from "@/components/shared";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <LoginForm />
      <ServiceWakeNotice />
    </div>
  );
}
