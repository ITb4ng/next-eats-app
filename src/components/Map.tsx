import { useCallback, useEffect, useRef, useState } from "react";

import { useKakaoMapSdk, type KakaoMapSdkStatus } from "@/hooks/useKakaoMapSdk";
import { useMapStore } from "@/zustand/index";

type MapCreationStatus = "idle" | "creating" | "ready" | "map-error";
type TileStatus = "idle" | "loading" | "ready" | "timeout";

export interface MapRuntimeStatus {
  sdk: KakaoMapSdkStatus;
  map: MapCreationStatus;
  tiles: TileStatus;
}

interface MapProps {
  lat?: number | null;
  lng?: number | null;
  zoom?: number;
  onStatusChange?: (status: MapRuntimeStatus) => void;
  presentation?: "fullscreen" | "compact";
}

const MAP_TILES_TIMEOUT_MS = 8000;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export default function Map({
  lat,
  lng,
  zoom,
  onStatusChange,
  presentation = "fullscreen",
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const initialLocationRef = useRef(useMapStore.getState().location);
  const setMap = useMapStore((state) => state.setMap);
  const { status: sdkStatus, errorMessage, retry: retrySdk } = useKakaoMapSdk();
  const [mapStatus, setMapStatus] = useState<MapCreationStatus>("idle");
  const [tileStatus, setTileStatus] = useState<TileStatus>("idle");
  const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
  const [mapRetryCount, setMapRetryCount] = useState(0);

  const resetMap = useCallback(() => {
    setMapErrorMessage(null);
    setMapStatus("idle");
    setTileStatus("idle");
    setMapRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    onStatusChange?.({
      sdk: sdkStatus,
      map: mapStatus,
      tiles: tileStatus,
    });
  }, [mapStatus, onStatusChange, sdkStatus, tileStatus]);

  useEffect(() => {
    if (sdkStatus !== "ready") {
      setMap(null);
      setMapStatus("idle");
      setTileStatus("idle");
      return;
    }

    const mapContainer = mapContainerRef.current;
    const maps = window.kakao?.maps;

    if (!mapContainer || !maps) {
      return;
    }

    let isMounted = true;
    let tileTimeoutId: number | null = null;
    let clickMarker: kakao.maps.Marker | null = null;
    let mapInstance: kakao.maps.Map | null = null;
    let handleTilesLoaded: kakao.maps.event.EventHandler | null = null;
    let handleMapClick: kakao.maps.event.EventHandler | null = null;

    try {
      setMapStatus("creating");
      setTileStatus("loading");
      setMapErrorMessage(null);

      const fallbackLocation = initialLocationRef.current;
      const centerLat = isFiniteNumber(lat) ? lat : fallbackLocation.lat;
      const centerLng = isFiniteNumber(lng) ? lng : fallbackLocation.lng;

      mapInstance = new maps.Map(mapContainer, {
        center: new maps.LatLng(centerLat, centerLng),
        level: zoom ?? fallbackLocation.zoom,
      });

      clickMarker = new maps.Marker({
        position: mapInstance.getCenter(),
      });
      clickMarker.setMap(mapInstance);

      handleTilesLoaded = () => {
        if (!isMounted) return;
        if (tileTimeoutId !== null) {
          window.clearTimeout(tileTimeoutId);
        }
        setTileStatus("ready");
        setMapStatus("ready");
      };

      handleMapClick = (event) => {
        if (!event?.latLng || !clickMarker) return;

        clickMarker.setPosition(event.latLng);
        const resultDiv = document.getElementById("clickLatlng");
        if (resultDiv) {
          resultDiv.textContent = `선택한 위치: 위도 ${event.latLng.getLat()}, 경도 ${event.latLng.getLng()}`;
        }
      };

      maps.event.addListener(mapInstance, "tilesloaded", handleTilesLoaded);
      maps.event.addListener(mapInstance, "click", handleMapClick);

      tileTimeoutId = window.setTimeout(() => {
        if (!isMounted) return;
        setTileStatus("timeout");
        setMapStatus("ready");
      }, MAP_TILES_TIMEOUT_MS);

      setMap(mapInstance);
    } catch (error) {
      setMap(null);
      setMapStatus("map-error");
      setTileStatus("idle");
      setMapErrorMessage(
        error instanceof Error ? error.message : "지도 화면 생성 중 오류가 발생했습니다."
      );
    }

    return () => {
      isMounted = false;
      if (tileTimeoutId !== null) {
        window.clearTimeout(tileTimeoutId);
      }

      if (mapInstance && handleTilesLoaded) {
        maps.event.removeListener(mapInstance, "tilesloaded", handleTilesLoaded);
      }

      if (mapInstance && handleMapClick) {
        maps.event.removeListener(mapInstance, "click", handleMapClick);
      }

      clickMarker?.setMap(null);
      setMap(null);
    };
  }, [lat, lng, mapRetryCount, sdkStatus, setMap, zoom]);

  const handleSdkRetry = () => {
    resetMap();
    retrySdk();
  };

  const showSdkLoading = sdkStatus === "idle" || sdkStatus === "loading";
  const showSdkFailure = sdkStatus === "error" || sdkStatus === "timeout";
  const showMissingEnv = sdkStatus === "missing-env";
  const showMapCreating = sdkStatus === "ready" && mapStatus === "creating";
  const showMapFailure = sdkStatus === "ready" && mapStatus === "map-error";
  const showTileTimeout =
    sdkStatus === "ready" && mapStatus === "ready" && tileStatus === "timeout";
  const isCompact = presentation === "compact";
  const sectionClassName = isCompact
    ? "relative bg-slate-50"
    : "relative min-h-[calc(100dvh-var(--navbar-height))]";
  const mapClassName = isCompact
    ? "h-0 w-full overflow-hidden bg-slate-100"
    : "h-[calc(100dvh-var(--navbar-height))] w-full bg-slate-100";
  const statePanelClassName = isCompact
    ? "relative flex items-center justify-center bg-slate-50 px-4 py-6"
    : "absolute inset-0 flex items-center justify-center bg-white/80 px-4";
  const errorPanelClassName = isCompact
    ? "relative flex items-center justify-center bg-slate-50 px-4 py-6"
    : "absolute inset-0 flex items-center justify-center bg-white/90 px-4";

  return (
    <section className={sectionClassName} aria-label="맛집 지도">
      <div ref={mapContainerRef} id="map" className={mapClassName} />

      {(showSdkLoading || showMapCreating) && (
        <div className={statePanelClassName} role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-md border border-gray-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-4 h-24 w-full animate-pulse rounded bg-gray-100" />
            <p className="font-semibold text-gray-900">
              {showSdkLoading ? "지도를 불러오는 중입니다." : "지도 화면을 준비하는 중입니다."}
            </p>
          </div>
        </div>
      )}

      {(showSdkFailure || showMapFailure || showMissingEnv) && (
        <div className={errorPanelClassName}>
          <div
            className="w-full max-w-sm rounded-md border border-red-100 bg-white p-5 text-center shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-semibold text-gray-900">
              {showMissingEnv
                ? "지도 설정값이 없어 지도를 표시할 수 없습니다."
                : showMapFailure
                ? "지도 화면을 만들지 못했습니다."
                : "지도를 불러오지 못했습니다."}
            </p>
            {(errorMessage || mapErrorMessage) && !showMissingEnv && (
              <p className="mt-2 text-sm text-gray-600">{errorMessage || mapErrorMessage}</p>
            )}
            {!showMissingEnv && (
              <button
                type="button"
                onClick={showMapFailure ? resetMap : handleSdkRetry}
                className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      {showTileTimeout && (
        <div className="absolute left-4 top-4 max-w-sm rounded-md border border-amber-200 bg-white/95 p-3 text-sm text-gray-700 shadow-sm">
          지도 기본 화면은 열렸지만 일부 타일 응답이 느립니다.
        </div>
      )}

      <div id="clickLatlng" className="sr-only" aria-live="polite" />
    </section>
  );
}
