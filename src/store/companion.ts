import { create } from 'zustand'

interface CompanionState {
  companion: boolean
  setCompanion: (val: boolean) => void
}

export const useCompanionStore = create<CompanionState>((set) => ({
  companion: true,
  setCompanion: (val) => set({ companion: val }),
}))
