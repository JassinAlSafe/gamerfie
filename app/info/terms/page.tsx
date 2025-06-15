import { InfoContent } from "@/components/layout/InfoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Game Vault",
  description: "Read our terms of service and user agreement for using Game Vault.",
};

export default function TermsPage() {
  return (
    <InfoContent
      title="Terms of Service"
      description="Please read these terms carefully before using Game Vault. By using our service, you agree to these terms."
    >
      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Game Vault, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Use License</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              Permission is granted to temporarily use Game Vault for personal, non-commercial 
              transitory viewing only. Under this license you may not:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Modify or copy the service</li>
              <li>• Use the service for commercial purposes</li>
              <li>• Attempt to reverse engineer any software</li>
              <li>• Remove any copyright or proprietary notations</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">User Accounts</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate and complete information. 
              You are responsible for:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Safeguarding your password</li>
              <li>• All activities that occur under your account</li>
              <li>• Immediately notifying us of unauthorized use</li>
              <li>• Ensuring your content complies with our guidelines</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Content Guidelines</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              When posting reviews, comments, or other content, you agree not to:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Post offensive, inappropriate, or harmful content</li>
              <li>• Violate any intellectual property rights</li>
              <li>• Spam or post repetitive content</li>
              <li>• Impersonate others or provide false information</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed">
              We strive to keep Game Vault available 24/7, but we cannot guarantee uninterrupted 
              service. We may need to suspend service for maintenance, updates, or due to factors 
              beyond our control.
            </p>
          </div>
        </section>

        <div className="mt-12 p-6 bg-purple-900/10 border border-purple-500/20 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Contact</h3>
          <p className="text-gray-300 text-sm">
            If you have any questions about these Terms of Service, please{" "}
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