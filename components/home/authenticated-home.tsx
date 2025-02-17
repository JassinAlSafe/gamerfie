"use client";

import { User } from "@supabase/supabase-js";
import { DashboardShell } from "../shell";

interface AuthenticatedHomeProps {
  user: User;
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  return (
    <DashboardShell>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>
        {/* Add your content here */}
      </div>
    </DashboardShell>
  );
}
