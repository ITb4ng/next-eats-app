import { create } from 'zustand';
import { LocationType, StoreType } from "@/interface";

// 기본 위치 값
const DEFAULT_LAT = 37.56673633865785;

const DEFAULT_LNG = 126.97855890178955;

const DEFAULT_ZOOM_LEVEL = 4;

// Map 상태를 관리하는 Store
interface MapStore {
  map: any | null;
  setMap: (map: any | null) => void;
  location: {
    lat: number;
    lng: number;
    zoom: number;
  };
  setLocation: (location: { lat: number; lng: number; zoom: number }) => void;
  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;
}

// Like 상태를 관리하는 Store
interface StoreState {
  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;
  toggleLike: (storeId: number) => void; // 찜 상태를 토글하는 함수 추가
}

interface SearchStore {
  q: string | null;
  district: string | null;
  setQ: (q: string | null) => void;
  setDistrict: (district: string | null) => void;
}

// Store 상태 업데이트 함수 개선: 상태 불변성을 유지하며 토글 처리
export const useStore = create<StoreState>((set) => ({
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
  toggleLike: (storeId) => set((state) => {
    if (state.currentStore && state.currentStore.id === storeId) {
      const newIsLiked = !state.currentStore.isLiked;
      return {
        currentStore: {
          ...state.currentStore,
          isLiked: newIsLiked,
        }
      };
    }
    return state;
  }),
}));

// Map Store 유지
export const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (map) => set({ map }),

  location: {
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM_LEVEL,
  },
  setLocation: (location) => set({ location }),

  // 아래 두 줄을 반드시 추가하세요!
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
}));

// Search 상태 관리
export const useSearchStore = create<SearchStore>((set) => ({
  q: null,
  district: null,
  setQ: (q) => set({ q }),
  setDistrict: (district) => set({ district }),
}));