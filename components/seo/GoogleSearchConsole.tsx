// Google Search Console and Analytics Integration Component
// Add this to your layout.tsx <head> section

export function GoogleSearchConsole() {
  // Add your Google Search Console verification meta tag here
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

  return (
    <>
      {/* Google Search Console Verification */}
      {googleSiteVerification && (
        <meta 
          name="google-site-verification" 
          content={googleSiteVerification} 
        />
      )}

      {/* Additional SEO meta tags for better indexing */}
      <meta name="google" content="notranslate" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Rich snippets hint */}
      <meta property="business:contact_data:street_address" content="" />
      <meta property="business:contact_data:locality" content="Global" />
      <meta property="business:contact_data:region" content="" />
      <meta property="business:contact_data:postal_code" content="" />
      <meta property="business:contact_data:country_name" content="Worldwide" />

      {/* Additional Open Graph tags for gaming */}
      <meta property="og:type" content="website" />
      <meta property="article:author" content="Game Vault Team" />
      <meta property="article:section" content="Gaming" />
      <meta property="article:tag" content="video games, game tracking, achievements, gaming community" />
    </>
  )
}

// SEO Helper Functions
export const seoUtils = {
  // Generate canonical URL
  getCanonicalUrl: (path: string) => `https://gamersvaultapp.com${path}`,
  
  // Generate structured data for different page types
  generateWebSiteSchema: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Game Vault",
    "alternateName": "Best Video Game Tracker",
    "url": "https://gamersvaultapp.com",
    "description": "The best video game tracker for managing your gaming progress, achievements, and backlog across all platforms.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://gamersvaultapp.com/all-games?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/gamevault",
      "https://facebook.com/gamevault", 
      "https://discord.gg/gamevault"
    ]
  }),

  generateOrganizationSchema: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Game Vault",
    "url": "https://gamersvaultapp.com",
    "logo": "https://gamersvaultapp.com/logo.svg",
    "description": "Best video game tracker platform for gamers worldwide",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Global"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://gamersvaultapp.com/info/contact",
      "availableLanguage": ["English"]
    }
  })
}

// Instructions for Google Search Console Setup
export const googleSearchConsoleInstructions = `
🔍 GOOGLE SEARCH CONSOLE SETUP:

1. Go to https://search.google.com/search-console
2. Add your property: https://gamersvaultapp.com  
3. Verify ownership using HTML meta tag method
4. Add the verification code to NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION env variable
5. Submit your sitemap: https://gamersvaultapp.com/sitemap.xml

📊 ADDITIONAL SEO TRACKING:

1. Google Analytics 4 (already integrated via Vercel Analytics)
2. Bing Webmaster Tools
3. Yandex Webmaster
4. Monitor rankings for keywords:
   - "best video game tracker"
   - "video game tracker app" 
   - "gaming achievement tracker"
   - "track video games"

🎯 NEXT STEPS:
1. Create social media accounts and add to structured data
2. Build backlinks from gaming forums and communities  
3. Create content marketing strategy with gaming blogs
4. Monitor search performance and optimize based on data
`