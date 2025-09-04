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
          Best Video Game Tracker - Game Vault | Track Games & Achievements
        </title>
        <meta
          name="description"
          content="The best video game tracker for gamers. Track your progress, achievements, and backlog across all platforms. Join 50k+ gamers using our free game tracking app with social features."
        />
        <meta
          name="keywords"
          content="best video game tracker, video game tracker app, game tracking website, gaming progress tracker, video game achievement tracker, track video games online, gaming backlog tracker, game collection manager, video game database, gaming statistics tracker, free video game tracker, gaming community platform, game completion tracker, achievement hunting tracker, gaming journal app"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Best Video Game Tracker - Game Vault | Free Gaming App"
        />
        <meta
          property="og:description"
          content="The #1 video game tracker app. Track your gaming progress, achievements & backlog across all platforms. Join 50k+ gamers for free!"
        />
        <meta property="og:site_name" content="Game Vault" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://gamersvaultapp.com/og-video-game-tracker.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Game Vault - Best Video Game Tracker App" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Best Video Game Tracker App - Game Vault"
        />
        <meta
          name="twitter:description"
          content="Track your gaming progress & achievements with the best free video game tracker. Join 50k+ gamers!"
        />
        <meta name="twitter:image" content="https://gamersvaultapp.com/twitter-video-game-tracker.png" />

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

        {/* Canonical URL is handled by individual pages */}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Game Vault - Best Video Game Tracker",
              description: "The best video game tracker app for gamers to track progress, achievements, and gaming backlog across all platforms",
              url: "https://gamersvaultapp.com",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock"
              },
              author: {
                "@type": "Organization",
                name: "Game Vault",
                url: "https://gamersvaultapp.com"
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "2547",
                bestRating: "5",
                worstRating: "1"
              },
              keywords: "best video game tracker, video game tracker app, gaming progress tracker, game achievement tracker, gaming backlog tracker, free video game tracker",
              featureList: [
                "Track video games across all platforms",
                "Achievement and progress tracking", 
                "Gaming backlog management",
                "Social gaming features",
                "Game reviews and ratings",
                "Gaming statistics and analytics"
              ],
              screenshot: [
                "https://gamersvaultapp.com/screenshot-1.png",
                "https://gamersvaultapp.com/screenshot-2.png"
              ]
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
