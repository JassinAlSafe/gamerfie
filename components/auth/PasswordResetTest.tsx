"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthActions, useAuthState } from "@/hooks/useAuthOptimized";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function PasswordResetTest() {
  const [testResults, setTestResults] = useState<{
    emailSent?: boolean;
    error?: string;
    testEmail?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { resetPassword } = useAuthActions();
  const { user } = useAuthState();

  const handleTestReset = async () => {
    if (!user?.email) {
      setTestResults({ error: "No user email found. Please sign in first." });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(user.email);
      setTestResults({ 
        emailSent: true, 
        testEmail: user.email,
        error: undefined 
      });
    } catch (error) {
      setTestResults({ 
        error: error instanceof Error ? error.message : "Unknown error",
        emailSent: false 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'Unknown';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Password Reset Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Current environment:
          </p>
          <Badge variant="outline">{getCurrentOrigin()}</Badge>
        </div>

        {user ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Signed in as:
            </p>
            <Badge variant="secondary">{user.email}</Badge>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please sign in first to test password reset
            </p>
          </div>
        )}

        <Button 
          onClick={handleTestReset} 
          disabled={!user?.email || isLoading}
          className="w-full"
        >
          {isLoading ? "Sending..." : "Test Password Reset"}
        </Button>

        {testResults.emailSent && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Reset email sent successfully!
              </p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Check your inbox: {testResults.testEmail}
            </p>
          </div>
        )}

        {testResults.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                Error
              </p>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {testResults.error}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Expected redirect URL:</strong></p>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {getCurrentOrigin()}/reset-password
          </code>
        </div>
      </CardContent>
    </Card>
  );
}