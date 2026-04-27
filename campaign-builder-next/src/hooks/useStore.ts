import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FilterState, AssetStage, AssetStatus, AssetType } from '@/types'

interface AppState {
  // Product selection
  selectedProduct: string | null
  setSelectedProduct: (id: string) => void

  // Asset filter state
  assetFilters: FilterState
  setAssetFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetAssetFilters: () => void

  // Calendar
  calendarQuarterOffset: number
  setCalendarQuarterOffset: (offset: number) => void

  // Framework banner
  frameworkLastEdited: string | null
  setFrameworkLastEdited: (ts: string) => void
  frameworkBannerDismissed: boolean
  dismissFrameworkBanner: () => void

  // Dark mode
  darkMode: boolean
  toggleDarkMode: () => void

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  stage: 'all',
  status: 'all',
  type: 'all',
  persona: '',
  channel: '',
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProduct: null,
      setSelectedProduct: (id) => set({ selectedProduct: id }),

      assetFilters: DEFAULT_FILTERS,
      setAssetFilter: (key, value) =>
        set((state) => ({
          assetFilters: { ...state.assetFilters, [key]: value },
        })),
      resetAssetFilters: () => set({ assetFilters: DEFAULT_FILTERS }),

      calendarQuarterOffset: 0,
      setCalendarQuarterOffset: (offset) => set({ calendarQuarterOffset: offset }),

      frameworkLastEdited: null,
      setFrameworkLastEdited: (ts) => set({ frameworkLastEdited: ts, frameworkBannerDismissed: false }),
      frameworkBannerDismissed: false,
      dismissFrameworkBanner: () => set({ frameworkBannerDismissed: true }),

      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'campaign-builder-store',
      partialize: (state) => ({
        selectedProduct: state.selectedProduct,
        calendarQuarterOffset: state.calendarQuarterOffset,
        frameworkLastEdited: state.frameworkLastEdited,
        darkMode: state.darkMode,
      }),
    }
  )
)
