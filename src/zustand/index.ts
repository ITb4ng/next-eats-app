import { create } from 'zustand';
import { LocationType, StoreType } from "@/interface";

// 기본 위치 값
const DEFAULT_LAT = 37.7777;
const DEFAULT_LNG = 127.23456;
const DEFAULT_ZOOM_LEVEL = 10;

interface MapStore {
  map: any | null;
  setMap: (map: any) => void;

  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;

  location: LocationType;
  setLocation: (location: LocationType) => void;
}

interface SearchStore {
  q: string | null;
  district: string | null;
  setQ: (q: string | null) => void;
  setDistrict: (district: string | null) => void;
}


export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),

  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),

  location: {
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM_LEVEL,
  },
  setLocation: (location) => set({ location }),
}));

export const useSearchStore = create<SearchStore>((set) => ({
  q: null,
  district: null,
  setQ: (q) => set({ q }),
  setDistrict: (district) => set({ district }),
}));