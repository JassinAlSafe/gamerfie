import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/AuthSkeleton";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        className="absolute top-6 left-6 md:top-8 md:left-8 p-2 text-muted-foreground hover:text-white transition-colors group"
      >
        <Link href="/" className="flex items-center text-lg">
          <ArrowLeft className="h-6 w-6 mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
          <span className="hidden sm:inline">Back to home</span>
        </Link>
      </Button>

      {/* Left side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex flex-col justify-center items-center w-full p-12 text-white">
          <Icons.logo className="h-12 w-12 mb-8" />
          <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
          <p className="text-lg text-center max-w-md opacity-90">
            Sign in to continue your gaming journey and track your progress.
          </p>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[500px] space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Icons.logo className="h-6 w-6 lg:hidden" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your details below to access your account
            </p>
          </div>
          <AuthErrorBoundary>
            <Suspense fallback={<AuthFormSkeleton />}>
              <SignInForm />
            </Suspense>
          </AuthErrorBoundary>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
