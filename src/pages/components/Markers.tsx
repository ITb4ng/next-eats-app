import { StoreType } from "@/interface";
import { useEffect, useCallback } from "react";
import { useMapStore } from "@/zustand";

interface MarkersProps {
  stores: StoreType[];
}

export default function Markers({ stores }: MarkersProps): null {
  const map = useMapStore((state) => state.map);
  const setCurrentStore = useMapStore((state) => state.setCurrentStore);
  const setLocation = useMapStore((state) => state.setLocation);

  const loadKakaoMarkers = useCallback(() => {
    if (map) {
      stores?.forEach((store) => {
        const imageSrc = store?.category
          ? `/images/markers/${store.category}.png`
          : "/images/markers/default.png";

        const imageSize = new window.kakao.maps.Size(40, 40);
        const imageOption = { offset: new window.kakao.maps.Point(27, 69) };

        const markerImage = new window.kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imageOption
        );

        const markerPosition = new window.kakao.maps.LatLng(
          store.lat,
          store.lng
        );

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          image: markerImage,
        });

        marker.setMap(map);

        const content = `<div class="infowindow">${store.name}</div>`;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: markerPosition,
          content,
          xAnchor: 0.6,
          yAnchor: 0.91,
        });

        window.kakao.maps.event.addListener(marker, "mouseover", function () {
          customOverlay.setMap(map);
        });

        window.kakao.maps.event.addListener(marker, "mouseout", function () {
          customOverlay.setMap(null);
        });

        window.kakao.maps.event.addListener(marker, "click", function () {
          setCurrentStore(store);
          setLocation({
            lat: store.lat,
            lng: store.lng,
            zoom: 4,
          });
        });
      });
    }
  }, [map, stores, setCurrentStore, setLocation]);

  useEffect(() => {
    loadKakaoMarkers();
  }, [loadKakaoMarkers, map]);

  return null;
}
