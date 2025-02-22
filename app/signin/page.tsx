import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { SignInForm } from "../components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-[350px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <SignInForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="underline underline-offset-4 hover:text-primary"
          >
            Forgot your password?
          </Link>
        </p>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
