import React from "react";

interface TextSectionProps {
  title: string;
  content: string;
}

export const TextSection = React.memo(({ title, content }: TextSectionProps) => {
  return (
    <div className="text-center group">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 group-hover:text-purple-300 transition-colors duration-300">
        {title}
      </h2>
      <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-8"></div>
      <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
        {content}
      </p>
    </div>
  );
});

TextSection.displayName = "TextSection";