import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/AuthSkeleton";

export default function SignUpPage() {
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
          <h1 className="text-4xl font-bold mb-4">Welcome to Gamerfie</h1>
          <p className="text-lg text-center max-w-md opacity-90">
            Join our gaming community and start tracking your gaming journey
            today.
          </p>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[500px] space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Icons.logo className="h-6 w-6 lg:hidden" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <AuthErrorBoundary>
            <Suspense fallback={<AuthFormSkeleton />}>
              <SignUpForm />
            </Suspense>
          </AuthErrorBoundary>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
