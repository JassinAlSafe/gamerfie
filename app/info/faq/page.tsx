import { InfoContent } from "@/components/layout/InfoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Game Vault",
  description: "Frequently asked questions about Game Vault and how to use our gaming platform.",
};

const faqs = [
  {
    question: "What is Game Vault?",
    answer: "Game Vault is a comprehensive gaming platform that allows you to track your games, connect with other gamers, write reviews, and discover new games across all platforms."
  },
  {
    question: "Is Game Vault free to use?",
    answer: "Yes! Game Vault is completely free to use. You can create an account, track games, write reviews, and connect with friends without any cost."
  },
  {
    question: "How do I add games to my library?",
    answer: "You can add games by searching for them in our database and clicking the 'Add to Library' button. You can then set your status (playing, completed, dropped, etc.) and rate the game."
  },
  {
    question: "Can I import my games from other platforms?",
    answer: "We're working on import features for popular gaming platforms. Currently, you can manually add games from any platform including Steam, PlayStation, Xbox, Nintendo Switch, and mobile platforms."
  },
  {
    question: "How do I connect with friends?",
    answer: "You can search for friends by their username or email address, or share your profile link with them. Once connected, you can see their gaming activity and reviews."
  },
  {
    question: "Can I write reviews for games?",
    answer: "Absolutely! You can write detailed reviews for any game in your library. Reviews help other gamers discover great games and avoid disappointing ones."
  }
];

export default function FAQPage() {
  return (
    <InfoContent
      title="Frequently Asked Questions"
      description="Find answers to common questions about Game Vault and how to make the most of our platform."
    >
      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-start">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mr-3 font-bold">
                Q{index + 1}.
              </span>
              {faq.question}
            </h3>
            <p className="text-gray-300 leading-relaxed pl-8">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800/50 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
        <p className="text-gray-300 mb-6">
          Can't find what you're looking for? Feel free to reach out to our support team.
        </p>
        <a
          href="/info/contact"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          Contact Support
          <span className="ml-2">→</span>
        </a>
      </div>
    </InfoContent>
  );
}