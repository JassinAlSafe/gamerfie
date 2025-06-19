import { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: {
    default: "Game Vault - Ultimate Video Game Tracker & Gaming Community Platform",
    template: "%s | Game Vault - Track Your Gaming Journey"
  },
  description: "Track your video game progress, discover new games, and connect with gamers worldwide. The ultimate gaming community platform for achievement tracking, game reviews, and gaming statistics.",
  keywords: [
    "video game tracker",
    "game tracking website", 
    "gaming progress tracker",
    "video game library management",
    "gaming community platform",
    "game achievement tracker",
    "track video games",
    "gaming statistics",
    "game collection manager",
    "gaming social network",
    "video game reviews",
    "game completion tracker",
    "gaming habits tracker",
    "game discovery platform",
    "gaming leaderboards",
    "game rating system",
    "gaming profile",
    "video game database",
    "gaming analytics",
    "game time tracker"
  ],
  authors: [{ name: "Game Vault Team" }],
  creator: "Game Vault",
  publisher: "Game Vault",
  metadataBase: new URL('https://gamersvaultapp.com'),
  alternates: {
    canonical: 'https://gamersvaultapp.com'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gamersvaultapp.com',
    siteName: 'Game Vault',
    title: 'Game Vault - Ultimate Video Game Tracking & Gaming Community Platform',
    description: 'Track your video game progress, discover new games, and connect with gamers worldwide. The ultimate gaming community platform for achievement tracking and game reviews.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Game Vault - Track Your Gaming Journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gamevault',
    creator: '@gamevault',
    title: 'Game Vault - Ultimate Video Game Tracker & Gaming Community',
    description: 'Track your video game progress, discover new games, and connect with gamers worldwide.',
    images: ['/twitter-image.png'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
  classification: 'Gaming Platform',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Game Vault',
    'application-name': 'Game Vault',
    'msapplication-TileColor': '#8b5cf6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#8b5cf6',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/icon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#8b5cf6',
      },
    ],
  }
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Game Vault",
  "url": "https://gamersvaultapp.com",
  "description": "Ultimate video game tracker and gaming community platform",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://gamersvaultapp.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://twitter.com/gamevault",
    "https://facebook.com/gamevault",
    "https://discord.gg/gamevault"
  ]
};

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Game Vault",
  "url": "https://gamersvaultapp.com",
  "logo": "https://gamersvaultapp.com/logo.png",
  "description": "Ultimate video game tracker and gaming community platform",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://gamersvaultapp.com/info/contact"
  }
};