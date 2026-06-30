"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/components/modules/identity/hooks/use-session";
import { logout } from "@/components/modules/identity/services/auth";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { loading, user } = useSession();

  async function onLogout() {
    await logout();
    router.push(ROUTES.login);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nimba</h1>
          <p className="text-sm text-muted-foreground">Espace analyste DRI</p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.fullName}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Se déconnecter
            </Button>
          </div>
        )}
      </header>

      <section className="py-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Le tableau de bord des dossiers de crédit sera disponible ici.
          </p>
        )}
      </section>
    </main>
  );
}
