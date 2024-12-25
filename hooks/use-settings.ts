import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

interface Settings {
  theme: string;
  gamesView: 'grid' | 'list';
  // ... other settings
}

interface SettingsStore {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

export const useSettings = create<SettingsStore>((set) => ({
  settings: {
    theme: 'dark',
    gamesView: 'list',
    // ... other settings
  },
  isLoading: true,
  updateSettings: async (newSettings) => {
    const supabase = createClientComponentClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
        },
      }));

      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  },
})); 