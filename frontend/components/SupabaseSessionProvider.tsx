"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseSessionContextValue = {
  session: Session | null;
  loading: boolean;
};

const SupabaseSessionContext = createContext<SupabaseSessionContextValue>({
  session: null,
  loading: true
});

export function SupabaseSessionProvider({
  children,
  initialSession
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState<boolean>(!initialSession);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading
    }),
    [session, loading]
  );

  return <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>;
}

export function useSupabaseSession() {
  return useContext(SupabaseSessionContext);
}
