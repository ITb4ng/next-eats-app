import { StoreType } from "@/interface";
import { useEffect, useMemo } from "react";
import { useMapStore } from "@/zustand";

export type MarkerRenderStatus =
  | "idle"
  | "rendering"
  | "success"
  | "empty"
  | "partial-marker-error"
  | "marker-error";

export interface MarkerRuntimeStatus {
  status: MarkerRenderStatus;
  total: number;
  renderable: number;
  rendered: number;
  skipped: number;
  failed: number;
  message?: string;
}

interface MarkersProps {
  stores: StoreType[];
  onStatusChange?: (status: MarkerRuntimeStatus) => void;
}

type MarkerListener = {
  target: object;
  type: string;
  handler: kakao.maps.event.EventHandler;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const makeMarkerStatus = (
  status: MarkerRenderStatus,
  total: number,
  renderable: number,
  rendered: number,
  failed: number,
  message?: string
): MarkerRuntimeStatus => ({
  status,
  total,
  renderable,
  rendered,
  skipped: total - renderable,
  failed,
  message,
});

export default function Markers({ stores, onStatusChange }: MarkersProps): null {
  const map = useMapStore((state) => state.map);
  const setCurrentStore = useMapStore((state) => state.setCurrentStore);
  const setLocation = useMapStore((state) => state.setLocation);

  const renderableStores = useMemo(
    () =>
      stores
        .map((store) => ({
          store,
          lat: toFiniteNumber(store.lat),
          lng: toFiniteNumber(store.lng),
        }))
        .filter(
          (item): item is { store: StoreType; lat: number; lng: number } =>
            item.lat !== null && item.lng !== null
        ),
    [stores]
  );

  useEffect(() => {
    if (!map) {
      onStatusChange?.(makeMarkerStatus("idle", stores.length, 0, 0, 0));
      return;
    }

    const maps = window.kakao?.maps;
    if (!maps) {
      onStatusChange?.(
        makeMarkerStatus(
          "marker-error",
          stores.length,
          renderableStores.length,
          0,
          renderableStores.length,
          "지도 SDK를 사용할 수 없어 마커를 표시하지 못했습니다."
        )
      );
      return;
    }

    if (stores.length === 0 || renderableStores.length === 0) {
      onStatusChange?.(
        makeMarkerStatus(
          "empty",
          stores.length,
          renderableStores.length,
          0,
          0,
          stores.length === 0
            ? "등록된 가게가 없습니다."
            : "지도는 정상적으로 불러왔지만 표시할 위치 정보가 없습니다."
        )
      );
      return;
    }

    let rendered = 0;
    let failed = 0;
    const markers: kakao.maps.Marker[] = [];
    const overlays: kakao.maps.CustomOverlay[] = [];
    const listeners: MarkerListener[] = [];

    onStatusChange?.(
      makeMarkerStatus("rendering", stores.length, renderableStores.length, 0, 0)
    );

    renderableStores.forEach(({ store, lat, lng }) => {
      try {
        const imageSrc = store.category
          ? `/images/markers/${store.category}.png`
          : "/images/markers/default.png";

        const imageSize = new maps.Size(40, 40);
        const imageOption = { offset: new maps.Point(27, 69) };
        const markerImage = new maps.MarkerImage(imageSrc, imageSize, imageOption);
        const markerPosition = new maps.LatLng(lat, lng);

        const marker = new maps.Marker({
          position: markerPosition,
          image: markerImage,
        });

        marker.setMap(map);

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
        const handleClick: kakao.maps.event.EventHandler = () => {
          setCurrentStore(store);
          setLocation({
            lat,
            lng,
            zoom: 4,
          });
        };

        maps.event.addListener(marker, "mouseover", handleMouseOver);
        maps.event.addListener(marker, "mouseout", handleMouseOut);
        maps.event.addListener(marker, "click", handleClick);

        markers.push(marker);
        overlays.push(customOverlay);
        listeners.push(
          { target: marker, type: "mouseover", handler: handleMouseOver },
          { target: marker, type: "mouseout", handler: handleMouseOut },
          { target: marker, type: "click", handler: handleClick }
        );
        rendered += 1;
      } catch {
        failed += 1;
      }
    });

    const status =
      rendered === 0
        ? "marker-error"
        : failed > 0
        ? "partial-marker-error"
        : "success";

    onStatusChange?.(
      makeMarkerStatus(
        status,
        stores.length,
        renderableStores.length,
        rendered,
        failed,
        status === "partial-marker-error"
          ? "일부 가게 위치를 지도에 표시하지 못했습니다."
          : status === "marker-error"
          ? "가게 위치를 지도에 표시하지 못했습니다."
          : undefined
      )
    );

    return () => {
      listeners.forEach(({ target, type, handler }) => {
        maps.event.removeListener(target, type, handler);
      });
      overlays.forEach((overlay) => overlay.setMap(null));
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, onStatusChange, renderableStores, setCurrentStore, setLocation, stores.length]);

  return null;
}
