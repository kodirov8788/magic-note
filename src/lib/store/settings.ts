import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  autosave: boolean;
  setAutosave: (value: boolean) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      autosave: false, // Default OFF
      setAutosave: (value) => set({ autosave: value }),
    }),
    {
      name: "user-settings",
    }
  )
);


