import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notifications: boolean;
  autoDetection: boolean;
  speedLimit: number;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SettingsState>) => Promise<void>;
}

const SETTINGS_KEY = '@copiloto/settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notifications: true,
  autoDetection: true,
  speedLimit: 80,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set(settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  updateSettings: async (newSettings: Partial<SettingsState>) => {
    try {
      const current = get();
      const updated = { ...current, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      set(updated);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
}));
