import { validateAdminPageAccess } from "@/app/api/lib/admin-auth";
import { DatabaseHealth } from "@/components/admin/DatabaseHealth";

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

/**
 * Server Component for admin database page
 * Uses server-side validation following Supabase 2025 best practices
 */
export default async function DatabaseAdminPage() {
  // Server-side admin validation - redirects if not admin
  const adminUser = await validateAdminPageAccess();
  
  // If we reach here, user is definitely admin
  console.log('✅ Rendering admin database page for:', adminUser?.id);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Database Health</h1>
          <p className="text-gray-400 mt-1">
            Admin: {adminUser?.email || 'Unknown'}
          </p>
        </div>
        <DatabaseHealth />
      </div>
    </div>
  );
}