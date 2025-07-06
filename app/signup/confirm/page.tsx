"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/ui/icons";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [email] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Email confirmation is disabled - redirect to signin
    toast({
      title: "Account created successfully!",
      description: "You can now sign in with your credentials.",
    });
    router.push("/signin");
  }, [router, toast]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendConfirmation = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Failed to resend email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Check your inbox for a new confirmation email.",
        });
        setResendCooldown(60); // 60 second cooldown
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        className="absolute top-6 left-6 md:top-8 md:left-8 p-2 text-muted-foreground hover:text-white transition-colors group"
      >
        <Link href="/signup" className="flex items-center text-lg">
          <ArrowLeft className="h-6 w-6 mr-2 group-hover:-translate-x-1 transition-transform duration-150" />
          <span className="hidden sm:inline">Back to signup</span>
        </Link>
      </Button>

      {/* Left side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Mail className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">
            Check Your Email
          </h1>
          <p className="text-lg text-center max-w-md opacity-90">
            We've sent you a confirmation link to complete your registration.
          </p>
        </div>
      </div>

      {/* Right side - Confirmation Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[500px] space-y-8">
          {/* Mobile icon */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="p-4 bg-purple-500/10 rounded-full">
              <Mail className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Confirm your email address
            </h1>
            <p className="text-muted-foreground">
              {searchParams.get("from") === "signin" 
                ? "Please confirm your email before signing in. We've sent a confirmation email to:"
                : "We've sent a confirmation email to:"
              }
            </p>
            <p className="text-lg font-medium text-foreground bg-muted/30 py-2 px-4 rounded-lg">
              {email}
            </p>
            {searchParams.get("from") === "signin" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Returning user?</strong> You need to confirm your email address before you can sign in. 
                  Once confirmed, you'll be able to access your account.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Check your email inbox</h3>
                  <p className="text-sm text-muted-foreground">
                    Look for an email from GameVault with the subject "Confirm
                    Your Signup"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Click the confirmation link</h3>
                  <p className="text-sm text-muted-foreground">
                    This will verify your email and complete your registration
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <div>
                  <h3 className="font-medium">Start gaming!</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll be automatically signed in and redirected to your
                    dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try
                resending.
              </p>

              <Button
                onClick={handleResendConfirmation}
                disabled={isResending || resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend confirmation email
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground border-t pt-6">
            <p>
              Having trouble?{" "}
              <Link
                href="/info/contact"
                className="font-medium text-primary hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Icons.logo className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
