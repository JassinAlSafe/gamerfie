"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthOptimized";
import { AuthFlowDebug } from "@/components/auth/AuthFlowDebug";

export default function DebugAuthPage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const { user } = useAuthState();

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    const updateUrlInfo = () => {
      if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.href);
        
        // Parse all URL parameters
        const params: Record<string, string> = {};
        const urlObj = new URL(window.location.href);
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        // Also check hash parameters (sometimes Supabase uses these)
        if (urlObj.hash) {
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          hashParams.forEach((value, key) => {
            params[`hash_${key}`] = value;
          });
        }
        
        setUrlParams(params);
      }
    };

    // Small delay to ensure client-side rendering
    const timer = setTimeout(updateUrlInfo, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const refresh = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
        
        {/* Auth Flow Detection */}
        <AuthFlowDebug title="Auth Flow Detection" />
        
        {/* Current URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current URL
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm break-all">
              {currentUrl}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => copyToClipboard(currentUrl)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </CardContent>
        </Card>

        {/* URL Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>URL Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(urlParams).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(urlParams).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-fit">
                      {key}
                    </Badge>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-1 break-all">
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No URL parameters found</p>
            )}
          </CardContent>
        </Card>

        {/* Current User */}
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">User ID</Badge>
                  <code className="text-sm">{user.id}</code>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Email</Badge>
                  <code className="text-sm">{user.email}</code>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Provider</Badge>
                  <code className="text-sm">{user.app_metadata?.provider || 'unknown'}</code>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No user authenticated</p>
            )}
          </CardContent>
        </Card>

        {/* Expected URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Reset URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For Password Reset Email:</h4>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <code className="text-sm">
                  {currentUrl ? new URL(currentUrl).origin : '[Your Domain]'}/auth/callback?code=...&type=recovery
                </code>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Should Redirect To:</h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <code className="text-sm">
                  {currentUrl ? new URL(currentUrl).origin : '[Your Domain]'}/reset-password?recovery=true
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Detection */}
        {(urlParams.error || urlParams.hash_error) && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Error Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urlParams.error && (
                  <div>
                    <Badge variant="destructive">Error</Badge>
                    <span className="ml-2">{urlParams.error}</span>
                  </div>
                )}
                {urlParams.error_description && (
                  <div>
                    <Badge variant="outline">Description</Badge>
                    <span className="ml-2">{decodeURIComponent(urlParams.error_description)}</span>
                  </div>
                )}
                {urlParams.hash_error && (
                  <div>
                    <Badge variant="destructive">Hash Error</Badge>
                    <span className="ml-2">{urlParams.hash_error}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Troubleshooting:</h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 space-y-1">
                  <li>• Check Supabase dashboard Site URL and Redirect URLs</li>
                  <li>• Verify email template redirect configuration</li>
                  <li>• Ensure email link hasn't expired (usually 1 hour)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}