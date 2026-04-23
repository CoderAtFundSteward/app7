import type { Metadata, Viewport } from "next";
import AppNav from "@/components/AppNav";
import { SupabaseSessionProvider } from "@/components/SupabaseSessionProvider";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundSteward Membership Dashboard",
  description:
    "Secure member portal for subscriptions, QuickBooks connectivity, and financial visibility."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseSessionProvider initialSession={session}>
          <div className="min-h-screen bg-slate-950 text-slate-100">
            <AppNav />
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
          </div>
        </SupabaseSessionProvider>
      </body>
    </html>
  );
}
