export const siteMetadata = {
  title: "Game Vault",
  description: "Track your gaming journey, discover new titles, and connect with fellow gamers in the ultimate gaming community platform.",
  metadataBase: new URL('https://gamersvaultapp.com'),
  authors: [{ name: "Game Vault Team", url: "https://gamersvaultapp.com" }],
  creator: "Game Vault",
  publisher: "Game Vault",
  category: "Gaming",
  classification: "Gaming Platform",
  keywords: [
    "gaming platform",
    "game tracking",
    "video games",
    "gaming community",
    "game collection",
    "achievement tracking",
    "gaming journal",
    "game reviews", 
    "gaming friends",
    "game library",
    "gaming stats",
    "game discovery",
    "gaming social network",
    "game wishlist",
    "gaming achievements",
    "game progress tracking",
    "gaming milestones",
    "video game database",
    "gaming hub",
    "game time tracker"
  ],
  openGraph: {
    title: "Game Vault - Track Your Gaming Journey",
    description: "The ultimate platform for gamers to track their library, discover new games, create playlists, and connect with friends.",
    url: "https://gamersvaultapp.com",
    siteName: "Game Vault",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Game Vault - Gaming Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Vault - Gaming Platform",
    description: "Track your gaming journey, discover new titles, and connect with fellow gamers.",
    images: ["/twitter-image.png"],
  },
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