"use client";

import { useState } from "react";
import { RefreshCw, Server } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Cold-start helper shown under the login form ONLY when the backend runs on a
 * host that sleeps when idle — detected by an `.onrender.com` origin in the
 * existing NEXT_PUBLIC_API_URL. Local dev and on-premise deployments never point
 * at such a host, so this renders nothing there.
 *
 * The button pings the backend directly (outside the same-origin `/api` proxy, so
 * the wait is not capped by the platform proxy timeout) to spin the instance up.
 * We use `no-cors`: reading the body is unnecessary — the request simply reaching
 * the instance is what wakes it, and the promise resolving means it answered.
 */
export function ServiceWakeNotice() {
  const [waking, setWaking] = useState(false);

  if (!env.apiUrl.includes(".onrender.com")) return null;
  // Health probe lives at the backend origin, not under the API base path.
  const healthUrl = `${new URL(env.apiUrl).origin}/actuator/health`;

  async function wake() {
    setWaking(true);
    try {
      await fetch(healthUrl, { mode: "no-cors", cache: "no-store" });
      toast.success("Le service est prêt. Vous pouvez vous connecter.");
    } catch {
      toast.info("Réveil en cours… patientez un instant puis réessayez.");
    } finally {
      setWaking(false);
    }
  }

  return (
    <Alert>
      <Server />
      <AlertTitle>Connexion lente au premier accès ?</AlertTitle>
      <AlertDescription>
        <p>
          En production, le service se met en veille après une période
          d&apos;inactivité pour économiser les ressources. Au premier accès,
          réveillez-le puis patientez 2 à 3 minutes le temps qu&apos;il redémarre.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void wake()} disabled={waking}>
          <RefreshCw className={cn(waking && "animate-spin")} />
          {waking ? "Réveil en cours…" : "Réveiller le service"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
