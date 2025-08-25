import React from "react";
import { InfoNavigation } from "@/components/info/InfoNavigation";

interface InfoContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showBreadcrumb?: boolean;
}

export function InfoContent({ 
  children, 
  title, 
  description, 
  className = "",
  showBreadcrumb = true 
}: InfoContentProps) {
  return (
    <div className={`p-6 lg:p-8 xl:p-12 ${className}`}>
      {showBreadcrumb && (
        <InfoNavigation variant="breadcrumb" />
      )}
      
      {(title || description) && (
        <div className="mb-12">
          {title && (
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
          )}
          {description && (
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-6"></div>
        </div>
      )}
      
      <div className="max-w-5xl">
        {children}
      </div>
    </div>
  );
}