import { create } from "zustand";

import { StoreType } from "@/interface";

const DEFAULT_LAT = 37.56673633865785;
const DEFAULT_LNG = 126.97855890178955;
const DEFAULT_ZOOM_LEVEL = 7;

interface MapStore {
  map: kakao.maps.Map | null;
  setMap: (map: kakao.maps.Map | null) => void;
  location: {
    lat: number;
    lng: number;
    zoom: number;
  };
  setLocation: (location: { lat: number; lng: number; zoom: number }) => void;
  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;
}

interface StoreState {
  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;
  toggleLike: (storeId: number) => void;
}

interface SearchStore {
  q: string | null;
  district: string | null;
  acceptsPaySupport: boolean;
  selectedDo: string | null;
  selectedCity: string | null;
  selectedDong: string | null;
  setQ: (q: string | null) => void;
  setDistrict: (district: string | null) => void;
  setAcceptsPaySupport: (acceptsPaySupport: boolean) => void;
  setSelectedDo: (selectedDo: string | null) => void;
  setSelectedCity: (selectedCity: string | null) => void;
  setSelectedDong: (selectedDong: string | null) => void;
  resetRegion: () => void;
}

export const useStore = create<StoreState>((set) => ({
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
  toggleLike: (storeId) =>
    set((state) => {
      if (state.currentStore && state.currentStore.id === storeId) {
        return {
          currentStore: {
            ...state.currentStore,
            isLiked: !state.currentStore.isLiked,
          },
        };
      }

      return state;
    }),
}));

export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),
  location: {
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM_LEVEL,
  },
  setLocation: (location) => set({ location }),
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
}));

export const useSearchStore = create<SearchStore>((set) => ({
  q: null,
  district: null,
  acceptsPaySupport: false,
  selectedDo: null,
  selectedCity: null,
  selectedDong: null,
  setQ: (q) => set({ q }),
  setDistrict: (district) => set({ district }),
  setAcceptsPaySupport: (acceptsPaySupport) => set({ acceptsPaySupport }),
  setSelectedDo: (selectedDo) => set({ selectedDo }),
  setSelectedCity: (selectedCity) => set({ selectedCity }),
  setSelectedDong: (selectedDong) => set({ selectedDong }),
  resetRegion: () =>
    set({
      selectedDo: null,
      selectedCity: null,
      selectedDong: null,
    }),
}));
