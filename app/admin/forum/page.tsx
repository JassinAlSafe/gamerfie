import { Metadata } from "next";
import { ForumAdminDashboard } from "@/components/admin/forum/ForumAdminDashboard";

export const metadata: Metadata = {
  title: "Forum Management | Admin - Game Vault",
  description: "Manage forum categories, moderate threads, and oversee community discussions",
};

export default function ForumAdminPage() {
  return <ForumAdminDashboard />;
}