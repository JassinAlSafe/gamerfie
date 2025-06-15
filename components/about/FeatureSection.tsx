import React from "react";

interface FeatureSectionProps {
  title: string;
  content: string[];
  icon?: string;
}

export const FeatureSection = React.memo(({ title, content }: FeatureSectionProps) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 hover:text-purple-300 transition-colors duration-300">
        {title}
      </h2>
      <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-12"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.map((item, index) => {
          const emojiMatch = item.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
          const emoji = emojiMatch ? emojiMatch[0] : "•";
          const text = emojiMatch ? item.slice(emojiMatch[0].length).trim() : item;

          return (
            <div 
              key={index} 
              className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              
              <div className="relative flex items-start space-x-4">
                <div className="text-2xl flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  {emoji}
                </div>
                <p className="text-gray-300 group-hover:text-white leading-relaxed text-left transition-colors duration-300">
                  {text}
                </p>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-4 right-4 w-6 h-6 border border-purple-500/20 rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

FeatureSection.displayName = "FeatureSection";