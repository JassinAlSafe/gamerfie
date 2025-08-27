"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function AuthErrorHandler() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');

    // Also check hash parameters (Supabase sometimes uses URL fragments)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');

    const actualError = error || hashError;
    const actualErrorCode = errorCode || hashErrorCode;
    const actualErrorDescription = errorDescription || hashErrorDescription;

    console.log('AuthErrorHandler: Detected error params:', {
      error: actualError,
      errorCode: actualErrorCode,
      errorDescription: actualErrorDescription
    });

    if (actualError) {
      let title = "Authentication Error";
      let description = "Something went wrong with authentication.";

      // Handle specific error cases
      switch (actualError) {
        case 'access_denied':
          if (actualErrorCode === 'otp_expired') {
            title = "Password Reset Link Expired";
            description = "Your password reset link has expired. Please request a new one.";
            
            // Auto-redirect to forgot password page after showing error
            setTimeout(() => {
              router.push('/forgot-password');
            }, 3000);
          } else {
            title = "Access Denied";
            description = actualErrorDescription ? decodeURIComponent(actualErrorDescription) : "Access was denied.";
          }
          break;
          
        case 'invalid_request':
          title = "Invalid Request";
          description = "The authentication request was invalid.";
          break;
          
        case 'unauthorized_client':
          title = "Unauthorized";
          description = "The client is not authorized for this request.";
          break;
          
        default:
          if (actualErrorDescription) {
            description = decodeURIComponent(actualErrorDescription);
          }
      }

      toast({
        title,
        description,
        variant: "destructive",
        duration: actualErrorCode === 'otp_expired' ? 5000 : 3000,
      });

      // Clean up URL parameters after showing the error
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('error');
      currentUrl.searchParams.delete('error_code');
      currentUrl.searchParams.delete('error_description');
      
      // Also clean hash parameters
      currentUrl.hash = '';
      
      // Replace URL without the error parameters
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [mounted, router, toast]);

  // This component doesn't render anything
  return null;
}