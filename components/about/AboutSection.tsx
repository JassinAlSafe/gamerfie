import React from "react";
import { AboutSection as AboutSectionType } from "@/types/about";

export const AboutSection = ({
  title,
  content,
  type,
  icon,
  stats,
}: AboutSectionType) => {
  const renderTextSection = () => (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
        {title}
      </h2>
      <p className="text-xl text-gray-300 leading-relaxed">
        {content as string}
      </p>
    </div>
  );

  const renderFeatureSection = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        {icon && <div className="text-6xl mb-4">{icon}</div>}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {(content as string[]).map((item, index) => (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:border-purple-500/30"
          >
            <p className="text-gray-300 text-lg font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatsSection = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-xl text-gray-400">{content as string}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats?.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-400/40 transition-all duration-300"
          >
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-gray-300 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListSection = () => (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {(content as string[]).map((item, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-3 flex-shrink-0"></div>
            <p className="text-gray-300 text-lg">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const getSectionContent = () => {
    switch (type) {
      case "text":
        return renderTextSection();
      case "feature":
        return renderFeatureSection();
      case "stats":
        return renderStatsSection();
      case "list":
        return renderListSection();
      default:
        return renderTextSection();
    }
  };

  return <section className="py-16 px-4">{getSectionContent()}</section>;
};
