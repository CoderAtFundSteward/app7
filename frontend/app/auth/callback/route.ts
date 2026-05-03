import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles Supabase email links that use ?code= (PKCE). Password reset redirectTo should point here.
 */
export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/update-password";
  const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/forgot-password`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Route handlers may not always allow setting cookies in all contexts.
        }
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/forgot-password`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
