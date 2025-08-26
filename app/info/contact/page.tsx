import { InfoContent } from "@/components/layout/InfoContent";
import { IconMail, IconBrandDiscord, IconBrandTwitter, IconMessageCircle } from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Gamerfie | Get Support & Help",
  description: "Get in touch with the Gamerfie team. We're here to help with any questions, feedback, or technical support.",
  keywords: ["contact", "support", "help", "feedback", "gaming support", "community"],
  openGraph: {
    title: "Contact Us - Gamerfie",
    description: "Get in touch with the Gamerfie team for support and help",
    type: "website",
  },
};

const contactMethods = [
  {
    title: "General Support",
    description: "For general questions, account issues, or technical support",
    icon: IconMail,
    contact: "support@gamerfie.com",
    action: "Send Email",
    href: "mailto:support@gamerfie.com"
  },
  {
    title: "Community Discord",
    description: "Join our community for real-time help and discussions",
    icon: IconBrandDiscord,
    contact: "discord.gg/gamerfie",
    action: "Join Discord",
    href: "https://discord.gg/gamerfie"
  },
  {
    title: "Feedback & Suggestions",
    description: "Share your ideas to help us improve Gamerfie",
    icon: IconMessageCircle,
    contact: "feedback@gamerfie.com",
    action: "Send Feedback",
    href: "mailto:feedback@gamerfie.com"
  },
  {
    title: "Follow Updates",
    description: "Stay updated with the latest news and announcements",
    icon: IconBrandTwitter,
    contact: "@GamefieApp",
    action: "Follow Us",
    href: "https://twitter.com/gamerfieapp"
  }
];

export default function ContactPage() {
  return (
    <InfoContent
      title="Contact Us"
      description="We're here to help! Reach out to us through any of the channels below and we'll get back to you as soon as possible."
    >
      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <div key={index} className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{method.description}</p>
                  <div className="text-sm text-gray-400 mb-4">{method.contact}</div>
                  <a
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium text-sm group-hover:translate-x-1 transition-all duration-300"
                  >
                    {method.action}
                    <span className="ml-1">→</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Response Info */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-800/50">
        <h3 className="text-2xl font-bold text-white mb-6">Response Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
              &lt; 2 hours
            </div>
            <div className="text-gray-300 text-sm">Discord Community</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">
              &lt; 24 hours
            </div>
            <div className="text-gray-300 text-sm">Email Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-2">
              &lt; 1 week
            </div>
            <div className="text-gray-300 text-sm">Feature Requests</div>
          </div>
        </div>
      </div>

      {/* Office Hours */}
      <div className="mt-8 p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
        <h4 className="text-lg font-semibold text-white mb-2">Support Hours</h4>
        <p className="text-gray-300 text-sm">
          Our support team is available Monday through Friday, 9 AM to 6 PM PST. 
          While we may not respond immediately outside these hours, we'll get back to you as soon as possible.
        </p>
      </div>
    </InfoContent>
  );
}