import { StoreType } from "@/interface";
import { useEffect } from "react";
import { useMapStore } from "@/zustand";

interface MarkerProps {
  store: StoreType;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export default function Marker({ store }: MarkerProps) {
  const map = useMapStore((state) => state.map);

  useEffect(() => {
    if (!map || !isFiniteNumber(store?.lat) || !isFiniteNumber(store?.lng)) {
      return;
    }

    const maps = window.kakao?.maps;
    if (!maps) return;

    const imageSrc = store.category
      ? `/images/markers/${store.category}.png`
      : "/images/markers/default.png";
    const imageSize = new maps.Size(40, 40);
    const imageOption = { offset: new maps.Point(24, 59) };
    const markerImage = new maps.MarkerImage(imageSrc, imageSize, imageOption);
    const markerPosition = new maps.LatLng(store.lat, store.lng);
    const marker = new maps.Marker({
      position: markerPosition,
      image: markerImage,
    });
    const content = document.createElement("div");
    content.className = "infowindow";
    content.textContent = store.name || "이름 없는 가게";
    const customOverlay = new maps.CustomOverlay({
      position: markerPosition,
      content,
      xAnchor: 0.6,
      yAnchor: 0.91,
    });
    const handleMouseOver: kakao.maps.event.EventHandler = () => {
      customOverlay.setMap(map);
    };
    const handleMouseOut: kakao.maps.event.EventHandler = () => {
      customOverlay.setMap(null);
    };

    marker.setMap(map);
    maps.event.addListener(marker, "mouseover", handleMouseOver);
    maps.event.addListener(marker, "mouseout", handleMouseOut);

    return () => {
      maps.event.removeListener(marker, "mouseover", handleMouseOver);
      maps.event.removeListener(marker, "mouseout", handleMouseOut);
      customOverlay.setMap(null);
      marker.setMap(null);
    };
  }, [map, store]);

  return null;
}
