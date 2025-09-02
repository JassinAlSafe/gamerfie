import { InfoContent } from "@/components/layout/InfoContent";
import { FAQClient } from "@/components/faq/FAQClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Video Game Tracker Help | Game Vault Support",
  description: "Get answers about the best video game tracker. Learn how to track games, achievements, progress, and backlog management on Game Vault. Free gaming platform support.",
  keywords: [
    "video game tracker FAQ",
    "game tracker help",
    "video game tracking support", 
    "how to track video games",
    "game tracker questions",
    "video game progress tracker help",
    "gaming achievement tracker FAQ",
    "backlog tracker support",
    "video game tracker guide",
    "game tracking platform help"
  ],
  openGraph: {
    title: "FAQ - Best Video Game Tracker Help | Game Vault", 
    description: "Get answers about using the best video game tracker. Learn how to track your gaming progress, achievements, and manage your backlog.",
    type: "website",
    url: "https://gamersvaultapp.com/info/faq",
    siteName: "Game Vault",
  },
  twitter: {
    title: "Video Game Tracker FAQ - Game Vault",
    description: "Get help with the best video game tracker platform. Learn how to track games, achievements, and progress.",
    card: "summary",
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/info/faq"
  }
};

export default function FAQPage() {
  // FAQ structured data for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Game Vault and how does it work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Game Vault is the best video game tracker that helps you track your gaming progress, achievements, and backlog across all platforms. Simply create a free account, add games to your library, and track your progress as you play."
        }
      },
      {
        "@type": "Question", 
        "name": "Is Game Vault really free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Game Vault is completely free forever. All features including game tracking, achievement monitoring, progress tracking, and social features are available at no cost."
        }
      },
      {
        "@type": "Question",
        "name": "Which gaming platforms does Game Vault support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Game Vault supports all major gaming platforms including PlayStation, Xbox, Nintendo Switch, PC (Steam, Epic Games), and mobile platforms. Track your games across all platforms in one place."
        }
      },
      {
        "@type": "Question",
        "name": "How do I track my video game achievements?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our video game achievement tracker automatically syncs with your gaming accounts to track trophies, achievements, and progress. You can also manually update your achievement progress and set completion goals."
        }
      },
      {
        "@type": "Question",
        "name": "Can I manage my gaming backlog with Game Vault?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Game Vault includes a powerful gaming backlog tracker that helps you organize unplayed games, set priorities, and plan your gaming sessions based on available time."
        }
      }
    ]
  }

  return (
    <>
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData)
        }}
      />
      
      <InfoContent
        title="Video Game Tracker FAQ"
        description="Get answers about using the best video game tracker platform. Learn how to track your gaming progress, achievements, and manage your backlog effectively."
      >
        <FAQClient />
      </InfoContent>
    </>
  );
}