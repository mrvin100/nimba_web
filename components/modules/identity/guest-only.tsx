"use client";

import { useEffect } from "react";
import { landingPath } from "./auth-access";
import { useSession } from "./useIdentity";
import { Spinner } from "@/components/ui/spinner";

/**
 * Inverse guard of the workspace shell, mounted ONCE by the public (auth)
 * layout: a visitor who already holds a session is forwarded to their board and
 * never sees the public screens. The check runs in the background so the guarded
 * content renders instantly for the common (unauthenticated) visitor.
 *
 * Hard navigation on purpose: the Router Cache built under another auth state
 * (e.g. the proxy's workspace→login redirects recorded while signed out) must
 * never be reused after the state changes.
 */
export function GuestOnly({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = useSession();

  useEffect(() => {
    if (session.user) {
      globalThis.window.location.replace(landingPath(session.user));
    }
  }, [session.user]);

  if (session.user) {
    return (
      <div className="flex min-h-40 items-center justify-center" aria-busy>
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
