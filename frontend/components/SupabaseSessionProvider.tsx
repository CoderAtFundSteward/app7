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
}: Readonly<{
  children: React.ReactNode;
  initialSession: Session | null;
}>) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState<boolean>(() => initialSession == null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    (): SupabaseSessionContextValue => ({ session, loading }),
    [session, loading]
  );

  return (
    <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>
  );
}

export function useSupabaseSession(): SupabaseSessionContextValue {
  return useContext(SupabaseSessionContext);
}
