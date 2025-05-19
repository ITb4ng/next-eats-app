import { create } from 'zustand';
import { StoreType } from "@/interface";



// 기본 위치 값 서울 - 춘천 간 수도인 서울별시청으로 지정함
const DEFAULT_LAT = 37.56673633865785;
const DEFAULT_LNG = 126.97855890178955;
const DEFAULT_ZOOM_LEVEL = 4;

declare namespace kakao.maps {
  function load(callback: () => void): void;
  namespace event {
    interface MouseEvent {
      latLng: {
        getLat(): number;
        getLng(): number;
      };
    }
    function addListener(
      target: any,
      type: string,
      callback: (event: MouseEvent) => void
    ): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Map {
	  panTo: any;
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    getCenter(): LatLng;
  }

  class Marker {
    constructor(options: { position: LatLng });
    setMap(map: Map): void;
    setPosition(position: LatLng): void;
  }
}

// Map 상태를 관리하는 Store
interface MapStore {
  map: kakao.maps.Map | null; // Kakao Maps 타입 지정
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

// Like 상태를 관리하는 Store
interface StoreState {
  currentStore: StoreType | null;
  setCurrentStore: (store: StoreType | null) => void;
  toggleLike: (storeId: number) => void; // 찜 상태를 토글하는 함수 추가
}

interface SearchStore {
  q: string | null;
  district: string | null;

  // 지역 선택 상태 추가
  selectedDo: string | null;
  selectedCity: string | null;
  selectedDong: string | null;

  // 상태 변경 함수들 추가
  setQ: (q: string | null) => void;
  setDistrict: (district: string | null) => void;

  setSelectedDo: (selectedDo: string | null) => void;
  setSelectedCity: (selectedCity: string | null) => void;
  setSelectedDong: (selectedDong: string | null) => void;

  // 초기화 함수 추가
  resetRegion: () => void;
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

  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
}));

// Search 상태 관리
export const useSearchStore = create<SearchStore>((set) => ({
  q: null,
  district: null,

  selectedDo: null,
  selectedCity: null,
  selectedDong: null,

  setQ: (q) => set({ q }),
  setDistrict: (district) => set({ district }),

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
