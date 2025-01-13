import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reviews | Gamerfie",
  description: "View and manage your game reviews",
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
