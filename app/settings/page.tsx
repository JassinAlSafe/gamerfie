"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, LayoutGrid, List } from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";
import { UserSettings, defaultSettings } from "@/types/settings";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface SettingsSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export default function SettingsPage() {
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState('general');
  const { settings: userSettings, updateSettings } = useSettings();

  // Load settings from profile when available
  useEffect(() => {
    if (profile?.settings) {
      setSettings(profile.settings as UserSettings);
      setHasChanges(false);
    }
  }, [profile]);

  // Track changes
  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-500">
        <p className="text-xl font-semibold">
          {error?.message || "Profile not found"}
        </p>
      </div>
    );
  }

  const handleSave = async () => {
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
  };

  const sections: SettingsSection[] = [
    { id: 'general', label: 'General' },
    { id: 'profile', label: 'Profile' },
    { id: 'library', label: 'Library' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />
        
        <div className="relative">
          {/* Header Content */}
          <div className="max-w-4xl mx-auto px-4 pt-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={cn(
                  "transition-colors duration-200",
                  hasChanges
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-700 cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {hasChanges ? "Save Changes" : "No Changes"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
            <div className="max-w-4xl mx-auto px-4">
              <nav className="flex space-x-4 py-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "px-3 py-2 rounded-lg transition-colors",
                      activeSection === section.id
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-grow bg-gray-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="space-y-6">
                {/* General Settings */}
                {activeSection === 'general' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Theme</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Dark Mode</label>
                            <p className="text-sm text-gray-400">Enable dark mode for the application</p>
                          </div>
                          <Switch
                            checked={settings.general?.darkMode ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                general: { ...settings.general, darkMode: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Accent Color</label>
                            <p className="text-sm text-gray-400">Choose your preferred accent color</p>
                          </div>
                          <select
                            value={settings.general?.accentColor ?? 'purple'}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                general: { ...settings.general, accentColor: e.target.value },
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
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Language & Region</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Language</label>
                            <p className="text-sm text-gray-400">Select your preferred language</p>
                          </div>
                          <select
                            value={settings.general?.language ?? 'en'}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                general: { ...settings.general, language: e.target.value },
                              })
                            }
                            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Time Zone</label>
                            <p className="text-sm text-gray-400">Set your local time zone</p>
                          </div>
                          <select
                            value={settings.general?.timeZone ?? 'UTC'}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                general: { ...settings.general, timeZone: e.target.value },
                              })
                            }
                            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                          >
                            <option value="UTC">UTC</option>
                            <option value="EST">EST</option>
                            <option value="PST">PST</option>
                            <option value="GMT">GMT</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Settings */}
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                      <div className="space-y-6">
                        <div>
                          <label className="text-white text-sm font-medium">Display Name</label>
                          <Input
                            value={profile?.display_name || ''}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                profile: { ...settings.profile, displayName: e.target.value },
                              })
                            }
                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                            placeholder="Enter your display name"
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm font-medium">Bio</label>
                          <textarea
                            value={profile?.bio || ''}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                profile: { ...settings.profile, bio: e.target.value },
                              })
                            }
                            className="mt-1 w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-h-[100px]"
                            placeholder="Tell us about yourself"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                      <div className="space-y-6">
                        <div>
                          <label className="text-white text-sm font-medium">Twitter</label>
                          <Input
                            value={settings.profile?.socialLinks?.twitter || ''}
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
                          <label className="text-white text-sm font-medium">Discord</label>
                          <Input
                            value={settings.profile?.socialLinks?.discord || ''}
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
                    </div>
                  </div>
                )}

                {/* Library Settings */}
                {activeSection === 'library' && (
                  <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Library</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm font-medium">View Style</label>
                          <p className="text-sm text-gray-400">Choose how games are displayed</p>
                        </div>
                        <select
                          value={settings.library?.view || 'grid'}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library,
                                view: e.target.value as "grid" | "list",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                        >
                          <option value="grid">Grid</option>
                          <option value="list">List</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm font-medium">Sort By</label>
                          <p className="text-sm text-gray-400">Default sorting for your games</p>
                        </div>
                        <select
                          value={settings.library?.sortBy || 'recent'}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library,
                                sortBy: e.target.value as "recent" | "name" | "rating",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                        >
                          <option value="recent">Recently Added</option>
                          <option value="name">Name</option>
                          <option value="rating">Rating</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm font-medium">Sort Order</label>
                          <p className="text-sm text-gray-400">Ascending or descending order</p>
                        </div>
                        <select
                          value={settings.library?.sortOrder || 'desc'}
                          onChange={(e) =>
                            handleSettingsChange({
                              ...settings,
                              library: {
                                ...settings.library,
                                sortOrder: e.target.value as "asc" | "desc",
                              },
                            })
                          }
                          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 min-w-[120px]"
                        >
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm font-medium">Show Playtime</label>
                          <p className="text-sm text-gray-400">Display game playtime in library</p>
                        </div>
                        <Switch
                          checked={settings.library?.showPlaytime ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: { ...settings.library, showPlaytime: checked },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm font-medium">Show Ratings</label>
                          <p className="text-sm text-gray-400">Display game ratings in library</p>
                        </div>
                        <Switch
                          checked={settings.library?.showRatings ?? true}
                          onCheckedChange={(checked) =>
                            handleSettingsChange({
                              ...settings,
                              library: { ...settings.library, showRatings: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Profile Visibility</label>
                            <p className="text-sm text-gray-400">Who can see your profile</p>
                          </div>
                          <select
                            value={settings.privacy?.profileVisibility || 'public'}
                            onChange={(e) =>
                              handleSettingsChange({
                                ...settings,
                                privacy: { ...settings.privacy, profileVisibility: e.target.value },
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
                            <label className="text-white text-sm font-medium">Show Online Status</label>
                            <p className="text-sm text-gray-400">Let others see when you're online</p>
                          </div>
                          <Switch
                            checked={settings.privacy?.showOnlineStatus ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                privacy: { ...settings.privacy, showOnlineStatus: checked },
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Show Game Activity</label>
                            <p className="text-sm text-gray-400">Let others see what games you're playing</p>
                          </div>
                          <Switch
                            checked={settings.privacy?.showGameActivity ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                privacy: { ...settings.privacy, showGameActivity: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Data & Security</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Two-Factor Authentication</label>
                            <p className="text-sm text-gray-400">Enable 2FA for additional security</p>
                          </div>
                          <Switch
                            checked={settings.privacy?.twoFactorEnabled ?? false}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                privacy: { ...settings.privacy, twoFactorEnabled: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Email Notifications</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Game Updates</label>
                            <p className="text-sm text-gray-400">Receive emails about game updates</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.emailGameUpdates ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, emailGameUpdates: checked },
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Friend Activity</label>
                            <p className="text-sm text-gray-400">Receive emails about friend activity</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.emailFriendActivity ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, emailFriendActivity: checked },
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Newsletter</label>
                            <p className="text-sm text-gray-400">Receive our monthly newsletter</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.emailNewsletter ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, emailNewsletter: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-xl">
                      <h2 className="text-xl font-semibold text-white mb-4">Push Notifications</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Friend Requests</label>
                            <p className="text-sm text-gray-400">Get notified about new friend requests</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.pushFriendRequests ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, pushFriendRequests: checked },
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Messages</label>
                            <p className="text-sm text-gray-400">Get notified about new messages</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.pushMessages ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, pushMessages: checked },
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white text-sm font-medium">Game Invites</label>
                            <p className="text-sm text-gray-400">Get notified about game invites</p>
                          </div>
                          <Switch
                            checked={settings.notifications?.pushGameInvites ?? true}
                            onCheckedChange={(checked) =>
                              handleSettingsChange({
                                ...settings,
                                notifications: { ...settings.notifications, pushGameInvites: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
