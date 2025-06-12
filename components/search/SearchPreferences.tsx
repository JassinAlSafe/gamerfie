"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Zap,
  HardDrive,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  UnifiedGameService,
  DataSource,
  SearchStrategy,
} from "@/services/unifiedGameService";
import { useUnifiedSearch } from "@/hooks/Games/use-unified-search";
import toast from "react-hot-toast";

interface UserPreferences {
  preferredSource: DataSource;
  searchStrategy: SearchStrategy;
  cacheEnabled: boolean;
  fallbackEnabled: boolean;
}

interface SearchPreferencesProps {
  onClose?: () => void;
}

export function SearchPreferences({ onClose }: SearchPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredSource: "auto",
    searchStrategy: "combined",
    cacheEnabled: true,
    fallbackEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { connectivity, getCacheStats, clearCache } = useUnifiedSearch();
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Load current preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Try to load from localStorage first
        const saved = localStorage.getItem("gameSearchPreferences");
        if (saved) {
          const savedPrefs = JSON.parse(saved);
          setPreferences((current) => ({ ...current, ...savedPrefs }));
        }
      } catch (error) {
        console.warn("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Update cache stats
  useEffect(() => {
    const updateCacheStats = () => {
      try {
        const stats = getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.warn("Failed to get cache stats:", error);
      }
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getCacheStats]);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await UnifiedGameService.saveUserPreferences(preferences);
      setHasChanges(false);
      toast.success("Search preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      preferredSource: "auto",
      searchStrategy: "combined",
      cacheEnabled: true,
      fallbackEnabled: true,
    });
    setHasChanges(true);
  };

  const handleClearCache = () => {
    clearCache();
    setCacheStats(getCacheStats());
  };

  const getDataSourceDescription = (source: DataSource): string => {
    switch (source) {
      case "igdb":
        return "Use IGDB for high-quality metadata and detailed game information";
      case "rawg":
        return "Use RAWG for better search capabilities and community data";
      case "auto":
        return "Automatically choose the best source based on query type";
      default:
        return "";
    }
  };

  const getStrategyDescription = (strategy: SearchStrategy): string => {
    switch (strategy) {
      case "combined":
        return "Search both APIs simultaneously and merge results for best coverage";
      case "igdb_first":
        return "Try IGDB first, fallback to RAWG if needed";
      case "rawg_first":
        return "Try RAWG first, fallback to IGDB if needed";
      case "parallel":
        return "Search both APIs in parallel and merge unique results";
      default:
        return "";
    }
  };

  const formatCacheAge = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Search Preferences</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* API Connectivity Status */}
      {connectivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>API Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>IGDB (High-quality metadata)</span>
              <Badge variant={connectivity.igdb ? "default" : "destructive"}>
                {connectivity.igdb ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" /> Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" /> Offline
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>RAWG (Search & discovery)</span>
              <Badge variant={connectivity.rawg ? "default" : "destructive"}>
                {connectivity.rawg ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" /> Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" /> Offline
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Data Source</CardTitle>
          <CardDescription>
            Choose your primary source for game information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["auto", "igdb", "rawg"] as DataSource[]).map((source) => (
            <div key={source} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`source-${source}`}
                  name="dataSource"
                  checked={preferences.preferredSource === source}
                  onChange={() =>
                    handlePreferenceChange("preferredSource", source)
                  }
                  className="w-4 h-4"
                />
                <Label
                  htmlFor={`source-${source}`}
                  className="font-medium capitalize"
                >
                  {source === "auto"
                    ? "Auto (Recommended)"
                    : source.toUpperCase()}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {getDataSourceDescription(source)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Search Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Search Strategy</CardTitle>
          <CardDescription>
            How to combine results from multiple sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              "combined",
              "igdb_first",
              "rawg_first",
              "parallel",
            ] as SearchStrategy[]
          ).map((strategy) => (
            <div key={strategy} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`strategy-${strategy}`}
                  name="searchStrategy"
                  checked={preferences.searchStrategy === strategy}
                  onChange={() =>
                    handlePreferenceChange("searchStrategy", strategy)
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor={`strategy-${strategy}`} className="font-medium">
                  {strategy
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {getStrategyDescription(strategy)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Performance</span>
          </CardTitle>
          <CardDescription>
            Optimize search speed and reliability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Search Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache results to improve speed for repeated searches
              </p>
            </div>
            <Switch
              checked={preferences.cacheEnabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange("cacheEnabled", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Fallback</Label>
              <p className="text-sm text-muted-foreground">
                Automatically try alternative sources if primary fails
              </p>
            </div>
            <Switch
              checked={preferences.fallbackEnabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange("fallbackEnabled", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      {preferences.cacheEnabled && cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4" />
              <span>Cache Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Cached Entries:</span>
                <p>
                  {cacheStats.size} / {cacheStats.maxSize}
                </p>
              </div>
              <div>
                <span className="font-medium">Cache TTL:</span>
                <p>{Math.floor(cacheStats.ttl / 1000)}s</p>
              </div>
            </div>

            {cacheStats.entries && cacheStats.entries.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Cache Entries:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {cacheStats.entries
                    .slice(0, 5)
                    .map((entry: any, index: number) => (
                      <div
                        key={index}
                        className="text-xs bg-muted p-2 rounded flex justify-between"
                      >
                        <span className="truncate">
                          {entry.key.split(":")[1]}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCacheAge(entry.age)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="w-full"
            >
              Clear Cache
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between space-x-2">
        <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
          Reset to Defaults
        </Button>

        <div className="space-x-2">
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={savePreferences} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Search Strategy Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <strong>Combined:</strong> Best overall results, slower but
                  comprehensive
                </li>
                <li>
                  • <strong>IGDB First:</strong> High-quality metadata, good for
                  known games
                </li>
                <li>
                  • <strong>RAWG First:</strong> Better discovery, good for
                  browsing
                </li>
                <li>
                  • <strong>Auto:</strong> Adapts based on connectivity and
                  query type
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
