"use client";

import { Button } from "@/components/ui/button";
import { withSentryWrapper } from "@/utils/withSentryWrapper";
import * as Sentry from "@sentry/nextjs";

function SentryTestPage() {
  const throwError = () => {
    try {
      const undefinedFunction = undefined;
      undefinedFunction();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };

  const throwUnhandledError = () => {
    Sentry.captureMessage("Manual error test", "error");
    Promise.reject(new Error("This is an unhandled promise rejection"));
  };

  const throwAPIError = async () => {
    try {
      const response = await fetch("/api/non-existent-endpoint");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };

  const testServerError = async () => {
    try {
      const res = await fetch("/api/sentry-test");
      if (!res.ok) {
        throw new Error("Server error test");
      }
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sentry Test Page</h1>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Test 1: Runtime Error</h2>
          <Button variant="destructive" onClick={throwError}>
            Trigger Runtime Error
          </Button>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Test 2: Unhandled Promise</h2>
          <Button variant="destructive" onClick={throwUnhandledError}>
            Trigger Unhandled Promise
          </Button>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Test 3: API Error</h2>
          <Button variant="destructive" onClick={throwAPIError}>
            Trigger API Error
          </Button>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Test 4: Server Error</h2>
          <Button variant="destructive" onClick={testServerError}>
            Trigger Server Error
          </Button>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Check your Sentry dashboard to see the captured errors.
      </p>
    </div>
  );
}

export default withSentryWrapper(SentryTestPage);
