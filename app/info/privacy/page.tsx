import { InfoContent } from "@/components/layout/InfoContent";
import { Shield, Eye, Lock, Users, Database, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Gamerfie | Your Data Protection",
  description: "Learn how Gamerfie protects your privacy and handles your personal data. Transparent privacy policy for our gaming platform.",
  keywords: ["privacy policy", "data protection", "GDPR", "gaming privacy", "personal data"],
  openGraph: {
    title: "Privacy Policy - Gamerfie",
    description: "Learn how Gamerfie protects your privacy and handles your personal data",
    type: "website",
  },
};

const privacySections = [
  {
    title: "Information We Collect",
    icon: Database,
    content: {
      description: "We collect information you provide directly to us and some data automatically when you use our service.",
      details: [
        {
          category: "Account Information",
          items: [
            "Email address and username (required for account creation)",
            "Display name and profile picture (optional)",
            "Gaming preferences and platform information"
          ]
        },
        {
          category: "Gaming Data",
          items: [
            "Games in your library and their status",
            "Reviews and ratings you write",
            "Progress tracking and achievements",
            "Friends and social connections"
          ]
        },
        {
          category: "Automatic Information",
          items: [
            "Device information and browser type",
            "Usage patterns and feature interactions",
            "Error logs for technical issues",
            "Analytics data (anonymized)"
          ]
        }
      ]
    }
  },
  {
    title: "How We Use Your Information",
    icon: Eye,
    content: {
      description: "We use your information solely to provide and improve our gaming platform services.",
      details: [
        {
          category: "Core Services",
          items: [
            "Maintain your gaming library and progress",
            "Enable social features and friend connections",
            "Provide personalized game recommendations",
            "Allow you to write and read reviews"
          ]
        },
        {
          category: "Platform Improvement",
          items: [
            "Analyze usage to improve features",
            "Fix bugs and technical issues",
            "Develop new gaming features",
            "Ensure platform security"
          ]
        },
        {
          category: "Communication",
          items: [
            "Send important account notifications",
            "Respond to your support requests",
            "Share major platform updates (with consent)",
            "Security alerts when necessary"
          ]
        }
      ]
    }
  },
  {
    title: "Data Security & Protection",
    icon: Lock,
    content: {
      description: "We implement industry-standard security measures to protect your personal information.",
      details: [
        {
          category: "Technical Safeguards",
          items: [
            "End-to-end encryption for sensitive data",
            "Secure HTTPS connections for all traffic",
            "Regular security audits and vulnerability testing",
            "Encrypted database storage"
          ]
        },
        {
          category: "Access Controls",
          items: [
            "Limited employee access to personal data",
            "Two-factor authentication for admin accounts",
            "Regular access reviews and permissions audit",
            "Secure development practices"
          ]
        },
        {
          category: "Data Protection",
          items: [
            "Regular automated backups",
            "Disaster recovery procedures",
            "Data breach response plan",
            "Compliance with security frameworks"
          ]
        }
      ]
    }
  },
  {
    title: "Your Privacy Rights",
    icon: Shield,
    content: {
      description: "You have full control over your personal information and how it's used.",
      details: [
        {
          category: "Access & Control",
          items: [
            "View and download all your personal data",
            "Update your profile and preferences anytime",
            "Control who can see your gaming activity",
            "Manage notification preferences"
          ]
        },
        {
          category: "Data Deletion",
          items: [
            "Delete your account and all associated data",
            "Remove specific reviews or social posts",
            "Clear your gaming library history",
            "Withdraw consent for optional features"
          ]
        },
        {
          category: "Privacy Settings",
          items: [
            "Set your profile to private or public",
            "Control friend request permissions",
            "Opt out of analytics (while maintaining core features)",
            "Customize data sharing preferences"
          ]
        }
      ]
    }
  },
  {
    title: "Data Sharing & Third Parties",
    icon: Users,
    content: {
      description: "We do not sell your personal data. Limited sharing occurs only for essential services.",
      details: [
        {
          category: "Service Providers",
          items: [
            "Cloud hosting infrastructure (secure data processing)",
            "Authentication services (account security)",
            "Email service providers (essential communications)",
            "Analytics tools (anonymized usage data only)"
          ]
        },
        {
          category: "Legal Requirements",
          items: [
            "Compliance with valid legal requests",
            "Protection against fraud and abuse",
            "Enforcement of our Terms of Service",
            "Emergency situations requiring disclosure"
          ]
        },
        {
          category: "Never Shared",
          items: [
            "We never sell your personal data to advertisers",
            "No sharing with data brokers or marketers",
            "Gaming preferences not sold to game companies",
            "Social connections remain private"
          ]
        }
      ]
    }
  }
];

export default function PrivacyPage() {
  return (
    <InfoContent
      title="Privacy Policy"
      description="We take your privacy seriously. This policy explains how we collect, use, and protect your personal information on Gamerfie."
    >
      {/* Privacy Commitment Banner */}
      <div className="mb-12 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500/20 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Our Privacy Promise</h3>
            <p className="text-gray-300 leading-relaxed">
              Your gaming data belongs to you. We're committed to transparency, giving you control, 
              and protecting your information with industry-leading security practices. We never sell 
              your personal data, and we only collect what's necessary to provide you with the best 
              gaming experience.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Sections */}
      <div className="space-y-8">
        {privacySections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-8 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>

              <p className="text-gray-300 leading-relaxed mb-8">
                {section.content.description}
              </p>

              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {section.content.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="bg-gray-800/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {detail.category}
                    </h4>
                    <ul className="space-y-2">
                      {detail.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-300 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Retention */}
      <div className="mt-12 p-6 bg-orange-900/10 border border-orange-500/20 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-500/20 rounded-full">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Data Retention</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              We retain your personal information only as long as necessary to provide our services and comply with legal obligations. 
              You can delete your account at any time, which will permanently remove all your personal data within 30 days, 
              except where we're required to retain certain information for legal compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Contact and Updates */}
      <div className="mt-8 space-y-6">
        <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/20 rounded-full">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Questions About Your Privacy?</h4>
              <p className="text-gray-300 text-sm mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, please{" "}
                <a href="/info/contact" className="text-purple-400 hover:text-purple-300 underline">
                  contact us
                </a>
                . We're committed to transparency and will respond to your privacy concerns promptly.
              </p>
              <a
                href="/info/contact"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium text-sm"
              >
                Contact Privacy Team
                <span className="ml-1">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center p-4 text-gray-400 text-sm">
          <p className="mb-2">Last updated: December 15, 2024</p>
          <p>
            This privacy policy may be updated periodically. We'll notify you of any significant changes 
            via email or through our platform notifications.
          </p>
        </div>
      </div>
    </InfoContent>
  );
}