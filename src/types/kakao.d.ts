// types/kakao.d.ts
export interface KakaoSize {
  new (width: number, height: number): KakaoSize;
}

export interface KakaoPoint {
  new (x: number, y: number): KakaoPoint;
}

export interface KakaoMarkerImage {
  new (
    src: string,
    size: KakaoSize,
    options?: { offset?: KakaoPoint }
  ): KakaoMarkerImage;
}

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMarker {
  setMap(map: KakaoMap): void;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoMap {
  // ...필요한 메서드만 정의
}

export interface KakaoMaps {
  Size: KakaoSize;
  Point: KakaoPoint;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  MarkerImage: new (
    src: string,
    size: KakaoSize,
    options?: { offset?: KakaoPoint }
  ) => KakaoMarkerImage;
  Marker: new (options: { position: KakaoLatLng; image?: KakaoMarkerImage }) => KakaoMarker;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: string | HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
  }) => KakaoCustomOverlay;
  event: {
    addListener: (
      target: any,
      type: string,
      callback: (...args: any[]) => void
    ) => void;
  };
}

declare global {
  interface Window {
    kakao: {
      maps: {
      MarkerImage: any;
      Point: any;
      Size: any;
      LatLng: new (lat: number, lng: number) => kakao.maps.LatLng;
      Map: new (container: HTMLElement, options: { center: kakao.maps.LatLng; level: number }) => kakao.maps.Map;
      Marker: new (options: { position: kakao.maps.LatLng }) => kakao.maps.Marker;
      event: {
        addListener: (
        target: kakao.maps.Map | kakao.maps.Marker,
        type: string,
        callback: (event: kakao.maps.event.MouseEvent) => void
        ) => void;
      };
      };
    };
  }
}
