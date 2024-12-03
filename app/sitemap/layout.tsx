import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
};

export const metadata: Metadata = {
  title: "Sitemap | Gamerfie",
  description: "Timeline of Gamerfie updates and changes",
  openGraph: {
    title: "Sitemap | Gamerfie",
    description: "Timeline of Gamerfie updates and changes",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

type SitemapLayoutProps = {
  children: React.ReactNode;
};

export default function SitemapLayout({ children }: SitemapLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-black overflow-x-hidden">
      {children}
    </div>
  );
}
