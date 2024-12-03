import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap | Gamerfie",
  description: "Timeline of Gamerfie updates and changes",
};

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-black">{children}</div>;
}
