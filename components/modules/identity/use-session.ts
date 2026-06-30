"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "./auth-service";
import type { MeResponse } from "./auth-schemas";

interface SessionState {
  loading: boolean;
  user: MeResponse | null;
}

/**
 * Light client-side session hook: reads the current analyst from /auth/me once.
 * No server-state cache library is used — the session does not change in the
 * background during a page's lifetime (Nimba layer-omission rule).
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, user: null });

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((user) => active && setState({ loading: false, user }))
      .catch(() => active && setState({ loading: false, user: null }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
