"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { landingPath, useSession } from "@/components/modules/identity";
import { ROUTES } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";

/**
 * Entry point. With a session cookie the visitor reaches here (the proxy gates
 * the unauthenticated case); we resolve the current user and forward them to their
 * landing workspace — admins to the admin console, everyone else to their
 * highest-priority direction.
 */
export default function HomePage() {
  const router = useRouter();
  const { loading, user } = useSession();

  useEffect(() => {
    if (loading) {
      return;
    }
    router.replace(user ? landingPath(user) : ROUTES.LOGIN);
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy>
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
