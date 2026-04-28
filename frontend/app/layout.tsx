import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import AppNav from "@/components/AppNav";
import { SupabaseSessionProvider } from "@/components/SupabaseSessionProvider";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FundSteward | Financial Intelligence for Mission-Driven Organizations",
  description:
    "Automated financial oversight by connecting your organization's mission to accounting tools. Private beta for mission-driven partners."
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
    <html lang="en" className={`${manrope.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        <SupabaseSessionProvider initialSession={session}>
          <AppNav />
          <main className="min-h-screen">{children}</main>
        </SupabaseSessionProvider>
      </body>
    </html>
  );
}
