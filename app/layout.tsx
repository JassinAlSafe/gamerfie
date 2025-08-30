"use client";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import FloatingHeader from "@/components/ui/header/FloatingHeader";
import { HeaderErrorBoundary } from "@/components/ui/header/header-error-boundary";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { usePathname } from "next/navigation";
import { CacheBuster } from "@/components/ui/cache-buster";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { AuthErrorHandler } from "@/components/auth/AuthErrorHandler";
import { FloatingActions } from "@/components/home/FloatingActions";
import { BetaBanner } from "@/components/ui/BetaBanner";
import { CookieConsent } from "@/components/ui/CookieConsent";
import AdminShortcuts from "@/components/admin/AdminShortcuts";
import { useSSRSafeUIState } from "@/components/layout/SSRSafeLayout";
import { Toaster } from "sonner";
import { initializeErrorMonitoring } from "@/utils/error-monitoring";
import { Analytics } from "@vercel/analytics/next";
import { getMobileOptimizedQueryConfig } from "@/utils/mobile-detection";

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
          queries: getMobileOptimizedQueryConfig(),
        },
      })
  );

  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);
  const { initTheme, isBetaBannerVisible } = useSSRSafeUIState();

  useEffect(() => {
    const cleanup = initTheme();

    // Initialize error monitoring
    initializeErrorMonitoring();

    // Register service worker for PWA functionality and image caching
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      }).then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    return cleanup;
  }, [initTheme]);

  const mainPaddingClass = !isAuthPage
    ? `flex-1 main-content-with-header`
    : "flex-1 no-header-spacing";

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Vercel Analytics DNS prefetch */}
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="" />

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
        className={`${inter.className} ${geistSans.variable} ${geistMono.variable} ${isBetaBannerVisible ? 'beta-banner-visible' : ''} ${isAuthPage ? 'auth-page' : ''}`}
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
                <AuthErrorHandler />
                <CacheBuster />
                {!isAuthPage && <BetaBanner />}
                {!isAuthPage && (
                  <HeaderErrorBoundary>
                    <FloatingHeader />
                  </HeaderErrorBoundary>
                )}
                <main className={mainPaddingClass}>{children}</main>
                {!isAuthPage && <FloatingActions />}
                {!isAuthPage && <AdminShortcuts variant="floating" />}
                <CookieConsent />
                {!isAuthPage && (
                  <div className="mt-auto">
                    <Footer />
                  </div>
                )}
              </div>
              <Toaster
                theme="dark"
                position="bottom-right"
                richColors
                closeButton
              />
            </ThemeProvider>
          </SupabaseProvider>
        </QueryClientProvider>
        {process.env.NODE_ENV === 'production' && (
          <Analytics 
            mode="production"
          />
        )}
      </body>
    </html>
  );
}
