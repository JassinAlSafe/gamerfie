import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your GameVault account",
};

// Loading component for Suspense boundary
function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="bg-card rounded-lg border shadow-lg p-8">
        <div className="grid gap-6">
          <div className="grid gap-2 text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          {/* Suspense boundary to handle client-side search params */}
          <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <a
              href="/info/contact"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}