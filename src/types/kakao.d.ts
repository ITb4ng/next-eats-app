export {};

declare global {
  interface Window {
    kakao: {
      maps: typeof kakao.maps;
    };
  }

  namespace kakao {
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

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      class MarkerImage {
        constructor(src: string, size: Size, options?: { offset?: Point });
      }

      class Marker {
        constructor(options: { position: LatLng; image?: MarkerImage });
        setMap(map: Map | null): void;
        setPosition(position: LatLng): void;
      }

      class CustomOverlay {
        constructor(options: {
          position: LatLng;
          content: string | HTMLElement;
          xAnchor?: number;
          yAnchor?: number;
        });
        setMap(map: Map | null): void;
      }

      namespace event {
        interface MouseEvent {
          latLng: LatLng;
        }

        type EventHandler = (event?: MouseEvent) => void;

        function addListener(target: object, type: string, callback: EventHandler): void;
        function removeListener(target: object, type: string, callback: EventHandler): void;
      }
    }
  }
}
