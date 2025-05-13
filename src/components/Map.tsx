import Script from "next/script";
import { useMapStore } from "@/zustand/index";

// 1. 타입 직접 정의
declare global {
  interface Window {
    kakao: typeof kakao; 
  }
}

declare namespace kakao.maps {
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
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    getCenter(): LatLng;
  }

  class Marker {
    constructor(options: { position: LatLng });
    setMap(map: Map): void;
    setPosition(position: LatLng): void;
  }
}

interface MapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}

export default function Map({ lat, lng, zoom }: MapProps) {
  const { location, setMap } = useMapStore();

  const loadKakaoMap = () => {
    window.kakao.maps.load(() => {
      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        console.warn("지도 컨테이너가 없습니다.");
        return;
      }

      const mapOption = {
        center: new window.kakao.maps.LatLng(
          lat ?? location.lat,
          lng ?? location.lng
        ),
        level: zoom ?? location.zoom,
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOption);

      const marker = new window.kakao.maps.Marker({
        position: map.getCenter(),
      });

      setMap(map);
      marker.setMap(map);

      // 2. 타입 좁히기
      window.kakao.maps.event.addListener(
        map,
        "click",
        (e: kakao.maps.event.MouseEvent) => {
          const latlng = e.latLng;
          marker.setPosition(latlng);

          const resultDiv = document.getElementById("clickLatlng");
          if (resultDiv) {
            resultDiv.innerHTML = `클릭한 위치의 위도는 ${latlng.getLat()} 이고, 경도는 ${latlng.getLng()} 입니다`;
          }
        }
      );
    });
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&autoload=false`}
        onReady={loadKakaoMap}
      />
      <div id="map" className="w-full h-screen"></div>
      <div id="clickLatlng" className="p-2 text-sm text-gray-600" />
    </>
  );
}
