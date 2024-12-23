import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Gamerfie",
  description: "View and manage your gaming profile",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
