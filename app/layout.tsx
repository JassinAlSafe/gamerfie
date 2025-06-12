"use client";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import FloatingHeader from "@/components/ui/header/FloatingHeader";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SupabaseProvider from "@/components/providers/supabase-provider";
import * as Sentry from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import { CacheBuster } from "@/components/ui/cache-buster";

// Optimized font loading with display swap for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

// Local Geist fonts for better performance
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

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
      <body
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable}`}
      >
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider initialSession={null}>
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
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
