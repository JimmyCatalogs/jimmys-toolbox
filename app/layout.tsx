import type { Metadata } from "next";
import "./globals.css";
import SectionNav from "@/components/SectionNav";
import { getHolidayImageUrl } from "@/lib/daily-holiday";

export const metadata: Metadata = {
  title: "Jimmy's Toolbox",
  description: "Internal tools and automations for the company",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const imageUrl = await getHolidayImageUrl()

  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased">
        <div
          className="min-h-screen bg-cover bg-center bg-fixed"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          <div className="min-h-screen bg-black/40">
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/40 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  🧰 Jimmy&apos;s Toolbox
                </h1>
              </div>
            </header>
            <SectionNav />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
