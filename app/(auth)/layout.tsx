import { GuestOnly } from "@/components/modules/identity";

/**
 * Public authentication screens (login, bootstrap, set-password) share one
 * centred layout and one inverse session guard: a signed-in visitor is
 * forwarded to their board, everyone else sees the page instantly. Pages stay
 * bare component renders.
 */
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <GuestOnly>{children}</GuestOnly>
    </main>
  );
}
