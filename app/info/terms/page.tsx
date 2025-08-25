import { InfoContent } from "@/components/layout/InfoContent";
import { Scale, FileText, AlertCircle, Shield, Users, Gavel } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Gamerfie | User Agreement",
  description: "Read Gamerfie's Terms of Service to understand your rights and responsibilities when using our gaming platform.",
  keywords: ["terms of service", "user agreement", "legal", "platform rules", "gaming terms"],
  openGraph: {
    title: "Terms of Service - Gamerfie",
    description: "Terms of Service and user agreement for Gamerfie gaming platform",
    type: "website",
  },
};

const termsSection = [
  {
    title: "Acceptance of Terms",
    icon: FileText,
    content: "By accessing and using Gamerfie, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
  },
  {
    title: "Use License & Account Rules",
    icon: Shield,
    content: [
      "You must be at least 13 years old to create an account",
      "You are responsible for maintaining the confidentiality of your account",
      "You agree to provide accurate and current information during registration",
      "One account per person - multiple accounts are not permitted",
      "You are responsible for all activities that occur under your account",
      "Accounts that are inactive for over 2 years may be subject to deletion"
    ]
  },
  {
    title: "Acceptable Use Policy",
    icon: Users,
    content: [
      "Be respectful to other users in reviews, comments, and interactions",
      "Do not share inappropriate, offensive, or harmful content",
      "No spam, harassment, or abuse of other community members",
      "Do not attempt to hack, exploit, or disrupt the platform",
      "Respect intellectual property rights of games and developers",
      "No commercial use without explicit written permission"
    ]
  },
  {
    title: "User-Generated Content",
    icon: FileText,
    content: [
      "You retain ownership of content you create (reviews, comments, posts)",
      "By posting content, you grant Gamerfie a license to display and distribute it",
      "We reserve the right to remove content that violates our guidelines",
      "Reviews should be honest and based on actual gaming experience",
      "We may feature outstanding user content in our marketing materials"
    ]
  },
  {
    title: "Platform Availability & Modifications",
    icon: AlertCircle,
    content: [
      "We strive for high uptime but cannot guarantee uninterrupted service",
      "We may temporarily suspend service for maintenance or updates",
      "We reserve the right to modify or discontinue features with notice",
      "Important changes will be communicated at least 30 days in advance"
    ]
  },
  {
    title: "Limitation of Liability",
    icon: Scale,
    content: [
      "Gamerfie is provided 'as is' without warranties of any kind",
      "We are not liable for indirect, incidental, or consequential damages",
      "Our liability is limited to the amount you paid for services (if any)",
      "We are not responsible for third-party content or external links"
    ]
  }
];

export default function TermsPage() {
  return (
    <InfoContent
      title="Terms of Service"
      description="These terms govern your use of Gamerfie. Please read them carefully to understand your rights and responsibilities."
    >
      {/* Important Notice */}
      <div className="mb-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Important Legal Agreement</h3>
            <p className="text-gray-300 leading-relaxed">
              By using Gamerfie, you're entering into a legal agreement with us. These terms explain 
              what you can expect from our service and what we expect from you.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        {termsSection.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-8 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>

              {typeof section.content === 'string' ? (
                <p className="text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              ) : (
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Information */}
      <div className="mt-12 p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
        <h4 className="text-lg font-semibold text-white mb-2">Questions About These Terms?</h4>
        <p className="text-gray-300 text-sm mb-4">
          If you have any questions about these Terms of Service, please{" "}
          <a href="/info/contact" className="text-purple-400 hover:text-purple-300 underline">
            contact us
          </a>
          . We're here to help clarify anything that might be unclear.
        </p>
      </div>

      {/* Legal Footer */}
      <div className="mt-8 text-center p-6 border-t border-gray-800/50">
        <div className="space-y-2 text-gray-400 text-sm">
          <p>Last updated: December 15, 2024</p>
          <p>Effective date: January 1, 2025</p>
        </div>
      </div>
    </InfoContent>
  );
}