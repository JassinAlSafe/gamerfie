import { InfoContent } from "@/components/layout/InfoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Game Vault",
  description: "Learn how Game Vault protects your privacy and handles your personal data.",
};

export default function PrivacyPage() {
  return (
    <InfoContent
      title="Privacy Policy"
      description="We take your privacy seriously. This policy explains how we collect, use, and protect your personal information."
    >
      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, or communicate with us. This may include:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Email address and username</li>
              <li>• Profile information (display name, avatar)</li>
              <li>• Gaming preferences and library data</li>
              <li>• Reviews and comments you post</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Provide and maintain our services</li>
              <li>• Personalize your gaming experience</li>
              <li>• Communicate with you about updates and features</li>
              <li>• Improve our platform and develop new features</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. This includes encryption 
              of sensitive data and regular security audits.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Access and update your personal information</li>
              <li>• Delete your account and associated data</li>
              <li>• Opt out of certain communications</li>
              <li>• Request a copy of your data</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Questions?</h3>
          <p className="text-gray-300 text-sm">
            If you have any questions about this Privacy Policy, please{" "}
            <a href="/info/contact" className="text-purple-400 hover:text-purple-300">
              contact us
            </a>
            .
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Last updated: December 15, 2024
          </p>
        </div>
      </div>
    </InfoContent>
  );
}