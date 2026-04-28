import MarketingNav from "@/components/marketing/MarketingNav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <MarketingNav />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        {children}
      </div>
    </div>
  );
}
