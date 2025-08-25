"use client";

import { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, BookOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqCategories = {
  "Getting Started": [
    {
      question: "What is Gamerfie?",
      answer: "Gamerfie is a comprehensive gaming platform that allows you to track your games, connect with other gamers, write reviews, and discover new games across all platforms. Whether you're into AAA titles, indie games, or mobile gaming, Gamerfie helps you organize and celebrate your gaming journey."
    },
    {
      question: "Is Gamerfie free to use?",
      answer: "Yes! Gamerfie is completely free to use. You can create an account, track unlimited games, write reviews, and connect with friends without any cost. We believe gaming communities should be accessible to everyone."
    },
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner and you can register using your email address or sign in with your existing Google account. It only takes a few seconds to get started!"
    }
  ],
  "Game Tracking": [
    {
      question: "How do I add games to my library?",
      answer: "You can add games by searching for them in our database and clicking the 'Add to Library' button. You can then set your status (want to play, playing, completed, dropped), add your rating, and write notes about your experience."
    },
    {
      question: "Can I import my games from other platforms?",
      answer: "We're actively working on import features for popular gaming platforms like Steam, PlayStation, Xbox, and Nintendo Switch. Currently, you can manually add games from any platform, and we're constantly expanding our game database."
    },
    {
      question: "How do I track my progress in games?",
      answer: "For each game in your library, you can update your completion percentage, play time, and current status. You can also log achievements you've earned and add personal notes about your experience."
    }
  ],
  "Social Features": [
    {
      question: "How do I connect with friends?",
      answer: "You can search for friends by their username, or share your profile link with them. Once connected, you can see their gaming activity, compare game libraries, and discover new games based on what your friends are playing."
    },
    {
      question: "Can I write reviews for games?",
      answer: "Absolutely! You can write detailed reviews for any game in your library. Reviews help other gamers discover great games and avoid disappointing ones. You can rate games from 1-5 stars and write as much or as little as you want."
    },
    {
      question: "How do I make my profile private?",
      answer: "In your profile settings, you can control who can see your gaming library, reviews, and activity. You can make your profile completely private, visible to friends only, or fully public."
    }
  ],
  "Technical Support": [
    {
      question: "The site seems slow or unresponsive. What can I do?",
      answer: "Try refreshing the page or clearing your browser cache. If the issue persists, please contact our support team with details about your browser and operating system."
    },
    {
      question: "I found a game that's missing from the database. How can I add it?",
      answer: "You can suggest new games to be added through our contact form. We regularly review and add new games to our database based on community requests."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account from your profile settings. Please note that this action is permanent and will remove all your data including your game library, reviews, and connections."
    }
  ]
};

export function FAQClient() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter FAQs based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return faqCategories;

    const filtered: typeof faqCategories = {};
    
    Object.entries(faqCategories).forEach(([category, faqs]) => {
      const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredFaqs.length > 0) {
        filtered[category as keyof typeof faqCategories] = filteredFaqs;
      }
    });
    
    return filtered;
  }, [searchTerm]);

  const totalFilteredFaqs = Object.values(filteredCategories).reduce((total, faqs) => total + faqs.length, 0);

  return (
    <>
      {/* Enhanced Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-gray-900/30 border-gray-800/50 focus:border-purple-500/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-700/50"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {/* Search Results Summary */}
        {searchTerm && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              {totalFilteredFaqs > 0 
                ? `Found ${totalFilteredFaqs} result${totalFilteredFaqs === 1 ? '' : 's'} for "${searchTerm}"`
                : `No results found for "${searchTerm}"`
              }
            </p>
          </div>
        )}
      </div>

      {/* FAQ Categories */}
      {totalFilteredFaqs === 0 && searchTerm ? (
        <div className="text-center py-12">
          <div className="p-4 bg-gray-800/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
          <p className="text-gray-400 mb-6">
            We couldn't find any FAQs matching "{searchTerm}". Try different keywords or{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-purple-400 hover:text-purple-300"
              onClick={() => setSearchTerm("")}
            >
              browse all FAQs
            </Button>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/info/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Contact Support
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredCategories).map(([category, faqs]) => (
            <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/20">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{category}</h2>
              <Badge variant="secondary" className="bg-gray-800/50">
                {faqs.length} questions
              </Badge>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`${category}-${index}`}
                  className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="text-white font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0">
                    <div className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
        </div>
      )}

      {/* Contact CTA */}
      <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800/50 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <MessageCircle className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Our support team is here to help you get the most out of Gamerfie.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/info/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Contact Support
            <span className="ml-2">→</span>
          </a>
          <a
            href="https://discord.gg/gamerfie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300"
          >
            Join Discord
          </a>
        </div>
      </div>
    </>
  );
}