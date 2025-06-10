"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import FloatingHeader from "@/components/ui/header/FloatingHeader";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { SessionProvider } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import { CacheBuster } from "@/components/ui/cache-buster";

const inter = Inter({ subsets: ["latin"] });

// Only initialize Sentry if DSN is properly configured
if (
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  process.env.NEXT_PUBLIC_SENTRY_DSN !== "your-sentry-dsn-here"
) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: process.env.NODE_ENV === "development",
  });
}

const authPages = ["/signin", "/signup", "/forgot-password"];

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

  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider initialSession={null}>
            <SessionProvider refetchInterval={300} refetchOnWindowFocus={false}>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                forcedTheme="dark"
              >
                <div className="min-h-screen flex flex-col">
                  <CacheBuster />
                  {!isAuthPage && <FloatingHeader />}
                  <main className={!isAuthPage ? "flex-1 pt-16" : "flex-1"}>
                    {children}
                  </main>
                  {!isAuthPage && (
                    <div className="mt-auto">
                      <Footer />
                    </div>
                  )}
                </div>
              </ThemeProvider>
            </SessionProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
