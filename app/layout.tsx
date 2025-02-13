"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import FloatingHeader from "@/components/ui/FloatingHeader";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SupabaseProvider from "@/components/providers/supabase-provider";
import * as Sentry from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"] });

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === "development",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider initialSession={null}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <div className="min-h-screen flex flex-col">
                <FloatingHeader />
                <main className="flex-1 pt-16">{children}</main>
                <div className="mt-auto">
                  <Footer />
                </div>
              </div>
            </ThemeProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
