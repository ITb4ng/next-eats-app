// types/kakao.d.ts
export {};

declare global {
  interface Window {
   kakao: KakaoNamespace.Kakao;
  }
}

declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class Map {
      constructor(container: HTMLElement, options: { center: LatLng; level: number });
      getCenter(): LatLng;
      panTo(latlng: LatLng): void;
    }

    class Marker {
      constructor(options: { position: LatLng });
      setMap(map: Map): void;
      setPosition(position: LatLng): void;
    }

    namespace event {
      interface MouseEvent {
        latLng: LatLng;
      }

      function addListener(
        target: any,
        type: string,
        callback: (event: MouseEvent) => void
      ): void;
    }
  }
}
