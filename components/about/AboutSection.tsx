import React from "react";
import { AboutSection as AboutSectionType } from "@/types/about";
import { TextSection } from "./TextSection";
import { FeatureSection } from "./FeatureSection";

export const AboutSection = React.memo(
  ({ title, content, type, icon }: AboutSectionType) => {
    const getSectionContent = () => {
      switch (type) {
        case "text":
          return <TextSection title={title} content={content as string} />;
        case "feature":
          return (
            <FeatureSection
              title={title}
              content={content as string[]}
              icon={icon}
            />
          );
        case "stats":
          return <TextSection title={title} content={content as string} />;
        case "list":
          return (
            <TextSection
              title={title}
              content={Array.isArray(content) ? content.join(", ") : content}
            />
          );
        default:
          return <TextSection title={title} content={content as string} />;
      }
    };

    return <div>{getSectionContent()}</div>;
  }
);

AboutSection.displayName = "AboutSection";
