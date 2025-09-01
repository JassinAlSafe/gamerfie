import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaming Profile - Track Games & Progress | Game Vault", 
  description: "Manage your gaming profile, track your game library, view statistics, connect with friends, and showcase your gaming achievements on Game Vault.",
  keywords: [
    "gaming profile",
    "game library",
    "gaming statistics", 
    "game tracker",
    "gaming achievements",
    "game progress",
    "gaming community",
    "video game collection"
  ],
  openGraph: {
    title: "Gaming Profile | Game Vault",
    description: "Manage your gaming profile, track your game library, view statistics, and connect with the gaming community.",
    type: "profile",
    url: "https://gamersvaultapp.com/profile",
    siteName: "Game Vault",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaming Profile | Game Vault", 
    description: "Manage your gaming profile, track your game library, view statistics, and connect with the gaming community.",
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/profile"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      <main className="pt-safe pb-safe">{children}</main>
    </div>
  );
}
