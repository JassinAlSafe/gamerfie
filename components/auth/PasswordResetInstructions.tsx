"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, Mail, Copy } from "lucide-react";

export function PasswordResetInstructions() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            Password Reset Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Supabase Dashboard Configuration
            </h3>
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step 1</Badge>
                  <span className="font-medium">Fix Redirect URLs</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to: <code>Dashboard → Authentication → URL Configuration</code>
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium">Site URL:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm">
                      https://gamersvaultapp.com
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Additional Redirect URLs:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm space-y-1">
                      <div>http://localhost:3000/auth/callback</div>
                      <div>https://gamersvaultapp.com/auth/callback</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step 2</Badge>
                  <span className="font-medium">Fix Email Template</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to: <code>Dashboard → Authentication → Email Templates → Reset Password</code>
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">❌ Current (causing errors):</p>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded font-mono text-sm">
                      {`<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>`}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">✅ Replace with:</p>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded font-mono text-sm relative">
                      <div>{`<h2>Reset Password</h2>`}</div>
                      <div>{`<p>Follow this link to reset your password:</p>`}</div>
                      <div>{`<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>`}</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step 3</Badge>
                  <span className="font-medium">Test the Flow</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Save the email template changes</p>
                  <p>2. Go to <code>/signin</code> → "Forgot password?"</p>
                  <p>3. Enter your email and request reset</p>
                  <p>4. Check email and click the reset link</p>
                  <p>5. Should redirect to <code>/reset-password?recovery=true</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-700 dark:text-blue-300">Why this is needed:</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              The current template uses <code>{`{{ .ConfirmationURL }}`}</code> which redirects directly to your site URL 
              with expired tokens, causing the <code>otp_expired</code> error. The new template uses the proper callback URL 
              with token hash for secure password reset.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}