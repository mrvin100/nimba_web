"use client";

import { useEffect } from "react";
import { landingPath, useSession } from "@/components/modules/identity";
import { ROUTES } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";

/**
 * Entry point. With a session cookie the visitor reaches here (the proxy gates
 * the unauthenticated case); we resolve the current user and forward them to their
 * landing workspace — admins to the admin console, everyone else to their
 * highest-priority direction. Hard navigation so a Router Cache entry recorded
 * under another auth state can never hijack the redirect.
 */
export default function HomePage() {
  const { loading, user } = useSession();

  useEffect(() => {
    if (loading) {
      return;
    }
    window.location.replace(user ? landingPath(user) : ROUTES.LOGIN);
  }, [loading, user]);

  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy>
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
