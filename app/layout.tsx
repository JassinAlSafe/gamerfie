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
import { usePathname } from "next/navigation";
import { CacheBuster } from "@/components/ui/cache-buster";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { FloatingActions } from "@/components/home/FloatingActions";

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
      <head>
        {/* SEO Meta Tags */}
        <title>
          Game Vault - Ultimate Video Game Tracking & Gaming Community Platform
        </title>
        <meta
          name="description"
          content="Track your video game progress, discover new games, and connect with gamers worldwide. The ultimate gaming community platform for achievement tracking, game reviews, and gaming statistics."
        />
        <meta
          name="keywords"
          content="video game tracker, game tracking website, gaming progress tracker, video game library management, gaming community platform, game achievement tracker, track video games, gaming statistics, game collection manager, gaming journal, game review platform, video game database, gaming social network, achievement hunting, game completion tracker"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Game Vault - Ultimate Video Game Tracking Platform"
        />
        <meta
          property="og:description"
          content="Track your gaming journey, discover new games, and connect with fellow gamers. Your complete gaming companion."
        />
        <meta property="og:site_name" content="Game Vault" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Game Vault - Track Your Gaming Journey"
        />
        <meta
          name="twitter:description"
          content="The ultimate platform for tracking video games, achievements, and connecting with the gaming community."
        />

        {/* Additional SEO */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="Game Vault Team" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://api.igdb.com" />
        <link rel="preconnect" href="https://api.rawg.io" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://gamevault.app" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Game Vault",
              description:
                "Ultimate video game tracking and gaming community platform",
              url: "https://gamevault.app",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "Game Vault",
              },
              keywords:
                "video games, game tracking, gaming community, achievements, game reviews",
            }),
          }}
        />
      </head>
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
                <AuthInitializer />
                <CacheBuster />
                {!isAuthPage && <FloatingHeader />}
                <main className={!isAuthPage ? "flex-1 pt-16" : "flex-1"}>
                  {children}
                </main>
                {!isAuthPage && <FloatingActions />}
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
