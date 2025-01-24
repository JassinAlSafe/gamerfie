import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Games | Gamerfie",
  description: "Discover and explore new games across different categories",
  openGraph: {
    title: "Explore Games | Gamerfie",
    description: "Discover and explore new games across different categories",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
