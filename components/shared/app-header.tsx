"use client";

import { useRouter } from "next/navigation";
import { useSession, logout } from "@/components/modules/identity";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

/**
 * Authenticated workspace header: shows the current analyst and a logout action.
 * Renders nothing until a session is known, so it stays invisible on the login
 * page (which shares the DRI layout).
 */
export function AppHeader() {
  const router = useRouter();
  const { user } = useSession();

  async function onLogout() {
    await logout();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  if (!user) return null;

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">Nimba</p>
          <p className="text-xs text-muted-foreground">Espace analyste DRI</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.fullName}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </header>
  );
}
