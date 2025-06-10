"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Only use Sentry if properly configured
    if (
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      process.env.NEXT_PUBLIC_SENTRY_DSN !== "your-sentry-dsn-here"
    ) {
      Sentry.captureException(error);
    } else {
      console.error("Error:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-6">{error.message}</p>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );
}
