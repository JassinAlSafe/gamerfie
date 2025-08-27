import { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your GameVault password",
};

function ForgotPasswordLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>
      <div className="grid gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <Suspense fallback={<ForgotPasswordLoading />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Remember your password?{" "}
            <a
              href="/signin"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}