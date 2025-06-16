"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, BarChart3, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import CookieManager from "@/utils/cookieManager";

interface CookieConsentProps {
  onAccept?: (level: string) => void;
}

export function CookieConsent({ onAccept }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = CookieManager.getCookie("consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    CookieManager.setConsent("all");
    setIsVisible(false);
    onAccept?.("all");
  };

  const handleAcceptEssential = () => {
    CookieManager.setConsent("essential");
    setIsVisible(false);
    onAccept?.("essential");
  };

  const handleSavePreferences = () => {
    let level: "essential" | "functional" | "analytics" | "all" = "essential";

    if (preferences.analytics) {
      level = "analytics";
    } else if (preferences.functional) {
      level = "functional";
    }

    CookieManager.setConsent(level);
    setIsVisible(false);
    setShowSettings(false);
    onAccept?.(level);
  };

  const handlePreferenceChange = (
    category: "functional" | "analytics",
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                🍪 We value your privacy
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic,
                and personalize content. You can customize your preferences or
                accept all cookies to continue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Essential Only
              </Button>

              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which types of cookies you'd like to accept. You can change
              these settings at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Essential Cookies</h4>
                  <Switch checked={true} disabled />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for basic site functionality, authentication, and
                  security. Cannot be disabled.
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start space-x-3">
              <Wrench className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Functional Cookies</h4>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("functional", checked)
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Remember your preferences, settings, and personalization
                  options for a better experience.
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Analytics Cookies</h4>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("analytics", checked)
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Help us understand how you use our site to improve performance
                  and user experience.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
