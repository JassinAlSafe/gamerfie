"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AuthFlowDebugProps {
  title?: string;
}

export function AuthFlowDebug({ title = "Auth Flow Debug" }: AuthFlowDebugProps) {
  const [debugInfo, setDebugInfo] = useState<{
    url: string;
    params: Record<string, string>;
    detectedFlow: 'oauth' | 'password_recovery' | 'unknown';
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Detection logic (same as callback)
    const hasCode = params.code;
    const hasState = params.state;
    const hasTokenHash = params.token_hash;
    const hasType = params.type;
    
    let detectedFlow: 'oauth' | 'password_recovery' | 'unknown' = 'unknown';
    let confidence = 0;

    if (hasType === 'recovery' || hasTokenHash) {
      detectedFlow = 'password_recovery';
      confidence = 95;
    } else if (hasCode && hasState) {
      detectedFlow = 'oauth';
      confidence = 90;
    } else if (hasCode && !hasState) {
      detectedFlow = 'password_recovery';
      confidence = 70;
    }

    setDebugInfo({
      url,
      params,
      detectedFlow,
      confidence
    });
  }, []);

  if (!debugInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading debug info...</p>
        </CardContent>
      </Card>
    );
  }

  const getFlowIcon = (flow: string) => {
    switch (flow) {
      case 'oauth':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'password_recovery':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'oauth':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'password_recovery':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getFlowIcon(debugInfo.detectedFlow)}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-lg border ${getFlowColor(debugInfo.detectedFlow)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Detected Flow:</span>
            <Badge variant="outline">
              {debugInfo.detectedFlow.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Confidence: {debugInfo.confidence}%
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">URL Parameters:</h4>
          {Object.keys(debugInfo.params).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(debugInfo.params).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {key}
                  </Badge>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {value.length > 50 ? value.substring(0, 50) + '...' : value}
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No parameters detected</p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Detection Rules:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• OAuth: <code>code</code> + <code>state</code> parameters</div>
            <div>• Password Recovery: <code>type=recovery</code> or <code>token_hash</code></div>
            <div>• Fallback: <code>code</code> without <code>state</code> (likely password recovery)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}