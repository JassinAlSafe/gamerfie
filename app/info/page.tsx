import { InfoContent } from "@/components/layout/InfoContent";
import { InfoNavigation } from "@/components/info/InfoNavigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Information Hub - Gamerfie | Help & Support",
  description: "Access all Gamerfie information pages including FAQ, contact details, privacy policy, terms of service, and latest news.",
  keywords: ["help", "support", "information", "FAQ", "contact", "privacy", "terms", "news"],
  openGraph: {
    title: "Information Hub - Gamerfie",
    description: "Access all Gamerfie information and support resources",
    type: "website",
  },
};

const featuredUpdates = [
  {
    title: "Enhanced Privacy Controls",
    description: "New privacy settings give you more control over your gaming data",
    badge: "New",
    href: "/info/privacy"
  },
  {
    title: "Community Guidelines Update", 
    description: "Updated terms of service with clearer community guidelines",
    badge: "Updated",
    href: "/info/terms"
  },
  {
    title: "Improved Support Channels",
    description: "Faster response times and new ways to get help",
    badge: "Improved", 
    href: "/info/contact"
  }
];

export default function InfoPage() {
  return (
    <InfoContent
      title="Information Hub"
      description="Everything you need to know about Gamerfie - from getting started to advanced features, privacy policies, and getting support."
    >
      {/* Featured Updates */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Recent Updates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredUpdates.map((update, index) => (
            <a
              key={index}
              href={update.href}
              className="group p-4 bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl hover:border-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  variant="secondary" 
                  className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  {update.badge}
                </Badge>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {update.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {update.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* All Info Pages */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">All Information Pages</h2>
        <InfoNavigation variant="grid" />
      </div>

      {/* Quick Help Section */}
      <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-gray-800/50">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Quick Help?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Most questions can be answered in our FAQ section. For technical issues or specific concerns, 
            our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/info/faq"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Browse FAQ
              <span className="ml-2">→</span>
            </a>
            <a
              href="/info/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </InfoContent>
  );
}