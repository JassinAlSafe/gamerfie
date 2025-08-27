"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useProfile } from "@/hooks/Profile/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Save, 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Library, 
  Globe,
  Eye,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";
import { UserSettings, defaultSettings } from "@/types/settings";
import { AvatarUpload } from "@/components/avatar-upload";
import { cn } from "@/lib/utils";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

export default function SettingsPage() {
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState("profile");

  // Load settings from profile when available
  useEffect(() => {
    if (profile?.settings) {
      setSettings(profile.settings as UserSettings);
      setHasChanges(false);
    }
  }, [profile]);

  // Track changes - memoized for performance
  const handleSettingsChange = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    setHasChanges(true);
  }, []);

  // Move handleSave hook to top level
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        ...profile,
        settings: settings,
      });
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  }, [profile, settings, updateProfile]);

  const sections: SettingsSection[] = useMemo(() => [
    { 
      id: "profile", 
      label: "Profile", 
      icon: <User className="w-4 h-4" />,
      description: "Manage your profile information and avatar"
    },
    { 
      id: "general", 
      label: "General", 
      icon: <Settings className="w-4 h-4" />,
      description: "Theme, language, and display preferences"
    },
    { 
      id: "library", 
      label: "Library", 
      icon: <Library className="w-4 h-4" />,
      description: "Game library display and sorting options"
    },
    { 
      id: "privacy", 
      label: "Privacy", 
      icon: <Shield className="w-4 h-4" />,
      description: "Control who can see your information"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: <Bell className="w-4 h-4" />,
      description: "Email and push notification preferences",
      badge: "3 Active"
    },
  ], []);

  // Conditional returns after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <Card className="bg-gray-800/50 border-red-500/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-red-400 mb-2">
              {error?.message || "Profile not found"}
            </p>
            <p className="text-gray-400">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
              <p className="text-sm text-gray-400">Manage your account and preferences</p>
            </div>
            
            {hasChanges && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-2">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left",
                      isActive
                        ? "bg-purple-500/10 border border-purple-500/20 text-white"
                        : "bg-gray-800/30 border border-white/5 text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-lg transition-colors",
                      isActive ? "bg-purple-500/20" : "bg-gray-700/50"
                    )}>
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{section.label}</span>
                        {section.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">

              {/* Profile Settings */}
              {activeSection === "profile" && (
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Update your profile details and avatar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-start gap-6 p-6 bg-gray-900/30 rounded-lg border border-white/5">
                        <div className="flex-shrink-0">
                          <AvatarUpload
                            userId={profile.id}
                            username={profile.username}
                            currentAvatarUrl={profile.avatar_url || null}
                            onAvatarUpdate={(url) => {
                              updateProfile({ ...profile, avatar_url: url });
                              toast.success("Avatar updated!");
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">Profile Photo</h4>
                          <p className="text-sm text-gray-400 mb-3">
                            Upload a new avatar to personalize your profile
                          </p>
                          <p className="text-xs text-gray-500">
                            Recommended: Square image, at least 200x200px, max 5MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium">Username</Label>
                          <Input
                            value={profile?.username || ""}
                            disabled
                            className="mt-1 bg-gray-900/50 border-gray-700 text-gray-400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>
                        <div>
                          <Label className="text-white text-sm font-medium">Email</Label>
                          <Input
                            value={profile?.email || ""}
                            disabled
                            className="mt-1 bg-gray-900/50 border-gray-700 text-gray-400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm font-medium">Display Name</Label>
                        <Input
                          value={profile?.display_name || ""}
                          onChange={(e) => {
                            updateProfile({ ...profile, display_name: e.target.value });
                            setHasChanges(true);
                          }}
                          className="mt-1 bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter your display name"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm font-medium">Bio</Label>
                        <textarea
                          value={profile?.bio || ""}
                          onChange={(e) => {
                            updateProfile({ ...profile, bio: e.target.value });
                            setHasChanges(true);
                          }}
                          className="mt-1 w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-h-[100px] resize-none"
                          placeholder="Tell us about yourself and your gaming interests..."
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(profile?.bio || "").length}/500 characters
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Social Links
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Connect your social media accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium">Twitter</Label>
                          <Input
                            value={settings.profile?.socialLinks?.twitter || ""}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                profile: {
                                  ...settings.profile,
                                  socialLinks: {
                                    ...settings.profile?.socialLinks,
                                    twitter: e.target.value,
                                  },
                                },
                              })
                            }
                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm font-medium">Discord</Label>
                          <Input
                            value={settings.profile?.socialLinks?.discord || ""}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                profile: {
                                  ...settings.profile,
                                  socialLinks: {
                                    ...settings.profile?.socialLinks,
                                    discord: e.target.value,
                                  },
                                },
                              })
                            }
                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                            placeholder="username#0000"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* General Settings */}
              {activeSection === "general" && (
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Appearance
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Customize the look and feel of the application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Dark Mode</Label>
                          <p className="text-sm text-gray-400">Enable dark theme for the application</p>
                        </div>
                        <Switch
                          checked={settings.general?.darkMode ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              general: {
                                ...settings.general,
                                darkMode: checked,
                              },
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Accent Color</Label>
                          <p className="text-sm text-gray-400">Choose your preferred accent color</p>
                        </div>
                        <select
                          value={settings.general?.accentColor ?? "purple"}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              general: {
                                ...settings.general,
                                accentColor: e.target.value,
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                        >
                          <option value="purple">Purple</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="red">Red</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Language & Region
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Set your language and regional preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium">Language</Label>
                          <select
                            value={settings.general?.language ?? "en"}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                general: {
                                  ...settings.general,
                                  language: e.target.value,
                                },
                              })
                            }
                            className="mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-white text-sm font-medium">Time Zone</Label>
                          <select
                            value={settings.general?.timeZone ?? "UTC"}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                general: {
                                  ...settings.general,
                                  timeZone: e.target.value,
                                },
                              })
                            }
                            className="mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value="UTC">UTC</option>
                            <option value="EST">EST</option>
                            <option value="PST">PST</option>
                            <option value="GMT">GMT</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Library Settings */}
              {activeSection === "library" && (
                <Card className="bg-gray-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Game Library Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize how your game library is displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white text-sm font-medium">View Style</Label>
                        <p className="text-sm text-gray-400 mb-2">Choose how games are displayed</p>
                        <select
                          value={settings.library?.view || "grid"}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                view: e.target.value as "grid" | "list",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                        >
                          <option value="grid">Grid View</option>
                          <option value="list">List View</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-white text-sm font-medium">Sort By</Label>
                        <p className="text-sm text-gray-400 mb-2">Default sorting for your games</p>
                        <select
                          value={settings.library?.sortBy || "recent"}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                sortBy: e.target.value as "recent" | "name" | "rating",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                        >
                          <option value="recent">Recently Added</option>
                          <option value="name">Name</option>
                          <option value="rating">Rating</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Show Playtime</Label>
                          <p className="text-sm text-gray-400">Display game playtime in library</p>
                        </div>
                        <Switch
                          checked={settings.library?.showPlaytime ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                showPlaytime: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Show Ratings</Label>
                          <p className="text-sm text-gray-400">Display game ratings in library</p>
                        </div>
                        <Switch
                          checked={settings.library?.showRatings ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                showRatings: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Auto-Track Gaming Time</Label>
                          <p className="text-sm text-gray-400">Automatically track time spent playing games</p>
                        </div>
                        <Switch
                          checked={settings.library?.autoTrackTime ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                autoTrackTime: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Show Game Covers</Label>
                          <p className="text-sm text-gray-400">Display game cover images in library</p>
                        </div>
                        <Switch
                          checked={settings.library?.showCovers ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library!,
                                showCovers: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium">Games per page</Label>
                          <p className="text-sm text-gray-400 mb-2">Number of games to show at once</p>
                          <select
                            value={settings.library?.gamesPerPage || 20}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                library: {
                                  ...settings.library!,
                                  gamesPerPage: parseInt(e.target.value),
                                },
                              })
                            }
                            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value={10}>10 games</option>
                            <option value={20}>20 games</option>
                            <option value={50}>50 games</option>
                            <option value={100}>100 games</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-white text-sm font-medium">Default Filter</Label>
                          <p className="text-sm text-gray-400 mb-2">Default status filter when viewing library</p>
                          <select
                            value={settings.library?.defaultFilter || "all"}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                library: {
                                  ...settings.library!,
                                  defaultFilter: e.target.value as "all" | "playing" | "completed" | "want_to_play",
                                },
                              })
                            }
                            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value="all">All Games</option>
                            <option value="playing">Currently Playing</option>
                            <option value="completed">Completed</option>
                            <option value="want_to_play">Want to Play</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Settings */}
              {activeSection === "privacy" && (
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Profile Privacy
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Control who can see your profile and activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Profile Visibility</Label>
                          <p className="text-sm text-gray-400">Who can see your profile</p>
                        </div>
                        <select
                          value={settings.privacy?.profileVisibility || "public"}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                profileVisibility: e.target.value as "public" | "friends" | "private",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Show Online Status</Label>
                          <p className="text-sm text-gray-400">Let others see when you're online</p>
                        </div>
                        <Switch
                          checked={settings.privacy?.showOnlineStatus ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                showOnlineStatus: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Show Game Activity</Label>
                          <p className="text-sm text-gray-400">Let others see what games you're playing</p>
                        </div>
                        <Switch
                          checked={settings.privacy?.showGameActivity ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                showGameActivity: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Security & Account
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage your account security and data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-400">Enable 2FA for additional security</p>
                        </div>
                        <Switch
                          checked={settings.privacy?.twoFactorEnabled ?? false}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                twoFactorEnabled: checked,
                              },
                            })
                          }
                        />
                      </div>
                      
                      <div className="border-t border-white/10 pt-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">Account Management</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                variant="outline"
                                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                                onClick={() => toast.success("Password reset email would be sent")}
                              >
                                Change Password
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                                onClick={() => toast.success("Data export feature coming soon")}
                              >
                                Export Data
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                            <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                            <p className="text-sm text-gray-400 mb-3">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <Button
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => toast.error("Account deletion requires additional verification")}
                            >
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications Settings */}
              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Notifications
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Choose what email notifications you want to receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Game Updates</Label>
                          <p className="text-sm text-gray-400">Receive emails about game updates and releases</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.emailGameUpdates ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailGameUpdates: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Friend Activity</Label>
                          <p className="text-sm text-gray-400">Receive emails about friend activity</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.emailFriendActivity ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailFriendActivity: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Newsletter</Label>
                          <p className="text-sm text-gray-400">Receive our monthly newsletter</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.emailNewsletter ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                emailNewsletter: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Push Notifications
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage browser and mobile push notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Friend Requests</Label>
                          <p className="text-sm text-gray-400">Get notified about new friend requests</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.pushFriendRequests ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                pushFriendRequests: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Messages</Label>
                          <p className="text-sm text-gray-400">Get notified about new messages</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.pushMessages ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                pushMessages: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white text-sm font-medium">Game Invites</Label>
                          <p className="text-sm text-gray-400">Get notified about game invites</p>
                        </div>
                        <Switch
                          checked={settings.notifications?.pushGameInvites ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                pushGameInvites: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}