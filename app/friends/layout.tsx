import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Hub | Gamerfie",
  description: "Connect, play, and share with your gaming friends - Manage friend requests, see who's online, and join games together",
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}