import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { SignInForm } from "@/components/auth/SignInForm";
import { ArrowLeft } from "lucide-react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth/AuthSkeleton";

export default function SignInPage() {
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Back Button - Enhanced positioning */}
      <Link 
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white transition-all duration-200 group z-20 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      {/* Left side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex flex-col justify-center items-center w-full p-8 xl:p-12 text-white">
          <Icons.logo className="h-10 w-10 xl:h-12 xl:w-12 mb-6 xl:mb-8" />
          <h1 className="text-3xl xl:text-4xl font-bold mb-3 xl:mb-4">Welcome back</h1>
          <p className="text-base xl:text-lg text-center max-w-md opacity-90 leading-relaxed">
            Sign in to continue your gaming journey and track your progress.
          </p>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-background">
        <div className="w-full max-w-[min(500px,90vw)] space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Icons.logo className="h-6 w-6 lg:hidden" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your details below to access your account
            </p>
          </div>
          <AuthErrorBoundary>
            <Suspense fallback={<AuthFormSkeleton mode="signin" />}>
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
