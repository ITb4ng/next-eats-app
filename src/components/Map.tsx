import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { useKakaoMapSdk, type KakaoMapSdkStatus } from "@/hooks/useKakaoMapSdk";
import {
  getMapStatusCopy,
  showRuntimeDebugState,
  type MapDebugState,
} from "@/lib/debugState";
import { fallbackToneClasses, type FallbackTone } from "@/lib/fallbackTone";
import { useMapStore } from "@/zustand/index";
import Loader from "./Loader";

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
  debugState?: MapDebugState | null;
  failureFallbackContent?: ReactNode;
  failureActionContent?: ReactNode;
  failureTone?: FallbackTone;
}

const MAP_TILES_TIMEOUT_MS = 8000;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export default function Map({
  lat,
  lng,
  zoom,
  onStatusChange,
  debugState,
  failureFallbackContent,
  failureActionContent,
  failureTone = "critical",
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const initialLocationRef = useRef(useMapStore.getState().location);
  const setMap = useMapStore((state) => state.setMap);
  const {
    status: sdkStatus,
    errorMessage,
    debugCode,
    retry: retrySdk,
  } = useKakaoMapSdk();
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
  const forcedDebugState = showRuntimeDebugState ? debugState : null;
  const showForcedLoading = forcedDebugState === "KAKAO_MAP_CREATING";
  const showForcedTileTimeout = forcedDebugState === "KAKAO_MAP_TILE_TIMEOUT";
  const showForcedFailure =
    !!forcedDebugState && !showForcedLoading && !showForcedTileTimeout;
  const loadingCopy = getMapStatusCopy(
    showMapCreating || showForcedLoading ? "KAKAO_MAP_CREATING" : "KAKAO_MAP_SDK_SCRIPT_ERROR"
  );
  const mapFailureDebugState: MapDebugState | null = showForcedFailure
    ? forcedDebugState
    : showMissingEnv
    ? "KAKAO_MAP_SDK_MISSING_CONFIG"
    : showMapFailure
    ? "KAKAO_MAP_CREATE_ERROR"
    : showSdkFailure
    ? debugCode || (sdkStatus === "timeout" ? "KAKAO_MAP_SDK_TIMEOUT" : "KAKAO_MAP_SDK_SCRIPT_ERROR")
    : null;
  const mapFailureCopy = mapFailureDebugState
    ? getMapStatusCopy(mapFailureDebugState)
    : null;
  const tileTimeoutCopy = getMapStatusCopy("KAKAO_MAP_TILE_TIMEOUT");
  const sectionClassName = "relative min-h-[calc(100dvh-var(--navbar-height))]";
  const mapClassName = "h-[calc(100dvh-var(--navbar-height))] w-full bg-slate-100";
  const statePanelClassName = "absolute inset-0 flex items-center justify-center bg-white/80 px-4";
  const errorPanelClassName = "absolute inset-0 flex items-center justify-center bg-white/90 px-4";
  const failureToneClassNames = fallbackToneClasses[failureTone];

  return (
    <section className={sectionClassName} aria-label="맛집 지도">
      <div ref={mapContainerRef} id="map" className={mapClassName} />

      {(showSdkLoading || showMapCreating || showForcedLoading) && (
        <div className={statePanelClassName} role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-md border border-[rgba(15,143,138,0.18)] bg-white/95 p-5 text-center text-gray-700 shadow-sm">
            <Loader className="my-0 mb-4" />
            <p className="font-semibold text-[--color-signature-dark]">
              {showSdkLoading && !showForcedLoading ? "지도를 불러오는 중입니다." : loadingCopy.title}
            </p>
            {showForcedLoading && showRuntimeDebugState && (
              <p className="mt-2 rounded bg-[--color-signature-soft] px-2 py-1 text-xs text-[--color-signature-dark]">
                debug: KAKAO_MAP_CREATING
              </p>
            )}
          </div>
        </div>
      )}

      {(showSdkFailure || showMapFailure || showMissingEnv || showForcedFailure) && (
        <div className={errorPanelClassName}>
          <div
            className={`w-full max-w-sm rounded-md border bg-white p-5 text-center text-gray-700 shadow-sm ${failureToneClassNames.panelBorder}`}
            role="alert"
            aria-live="assertive"
          >
            <p className="font-semibold text-gray-900">{mapFailureCopy?.title}</p>
            {mapFailureCopy?.message && (
              <p className="mt-2 text-sm text-gray-600">{mapFailureCopy.message}</p>
            )}
            {failureFallbackContent}
            {showRuntimeDebugState && mapFailureDebugState && (
              <p className={`mt-4 rounded px-2 py-1 text-xs ${failureToneClassNames.debug}`}>
                debug: {mapFailureDebugState}
                {errorMessage || mapErrorMessage ? ` / ${errorMessage || mapErrorMessage}` : ""}
              </p>
            )}
            {!showMissingEnv && !showForcedFailure && (
              <div className="mt-4 flex flex-row flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={showMapFailure ? resetMap : handleSdkRetry}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${failureToneClassNames.retryButton}`}
                >
                  다시 시도
                </button>
                {failureActionContent}
              </div>
            )}
          </div>
        </div>
      )}

      {(showTileTimeout || showForcedTileTimeout) && (
        <div className="absolute left-4 top-4 max-w-sm rounded-md border border-[rgba(15,143,138,0.18)] bg-white/95 p-3 text-sm text-gray-700 shadow-sm">
          <p className="font-semibold text-gray-900">{tileTimeoutCopy.title}</p>
          {tileTimeoutCopy.message && <p className="mt-1">{tileTimeoutCopy.message}</p>}
          {showRuntimeDebugState && (
            <p className="mt-2 text-xs text-[--color-signature-dark]">
              debug: KAKAO_MAP_TILE_TIMEOUT
            </p>
          )}
        </div>
      )}

      <div id="clickLatlng" className="sr-only" aria-live="polite" />
    </section>
  );
}
