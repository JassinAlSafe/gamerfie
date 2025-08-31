import { validateAdminPageAccess } from "@/app/api/lib/admin-auth";
import { redirect } from "next/navigation";

/**
 * Server Component wrapper for admin pages
 * Validates admin access server-side following Supabase 2025 best practices
 */
export async function AdminPageWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // This runs on the server and validates admin access
  // Uses getUser() for proper security validation
  const adminUser = await validateAdminPageAccess();
  
  // If validateAdminPageAccess returns, user is admin
  // Otherwise it redirects to home
  if (!adminUser) {
    redirect('/');
  }
  
  return <>{children}</>;
}