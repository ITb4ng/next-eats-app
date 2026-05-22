import axios, { AxiosError } from "axios";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";

import Map, { type MapRuntimeStatus } from "../components/Map";
import type { MarkerRuntimeStatus } from "../components/Markers";
import { StoreApiResponse } from "../interface";
import {
  getDebugReasonFromQuery,
  getDebugStateFromQuery,
  getRuntimeStateCopy,
  getStoreStatusCopy,
  isMapDebugState,
  isStoreDebugState,
  showRuntimeDebugState,
  type RuntimeDebugState,
  type RuntimeUiState,
  type StoreDebugState,
} from "../lib/debugState";
import { fallbackToneClasses, type FallbackTone } from "../lib/fallbackTone";
import Loader from "../components/Loader";

type StoreFetchStatus = "loading" | "success" | "empty" | "error";

const CurrentPosition = dynamic(() => import("../components/CurrentPosition"), {
  ssr: false,
});
const StoreBox = dynamic(() => import("../components/StoreBox"), {
  ssr: false,
});
const Markers = dynamic(() => import("../components/Markers"), {
  ssr: false,
});

interface ApiErrorBody {
  message?: string;
  code?: string;
}

const initialMapStatus: MapRuntimeStatus = {
  sdk: "idle",
  map: "idle",
  tiles: "idle",
};

const initialMarkerStatus: MarkerRuntimeStatus = {
  status: "idle",
  total: 0,
  renderable: 0,
  rendered: 0,
  skipped: 0,
  failed: 0,
};

const fetchHomeStores = async () => {
  const { data } = await axios.get<StoreApiResponse>("/api/stores");
  return data;
};

const isDatabaseDelayLikeError = (error: AxiosError<ApiErrorBody> | null) => {
  if (!error) return false;

  const status = error.response?.status;
  const message = `${error.response?.data?.message ?? ""} ${error.message}`.toLowerCase();

  return (
    (typeof status === "number" && (status >= 540 || [502, 503, 504].includes(status))) ||
    message.includes("timeout") ||
    message.includes("gateway") ||
    message.includes("database") ||
    message.includes("supabase") ||
    message.includes("connection")
  );
};

const getStoreDebugState = (error: AxiosError<ApiErrorBody> | null): StoreDebugState => {
  if (isDatabaseDelayLikeError(error)) {
    return "store-database-delay";
  }

  if (!error?.response) {
    return "store-network-error";
  }

  return "store-api-error";
};

type StoreRequestDebugState = Extract<
  StoreDebugState,
  "store-database-delay" | "store-network-error" | "store-api-error"
>;

const storeRequestDebugStates: StoreRequestDebugState[] = [
  "store-database-delay",
  "store-network-error",
  "store-api-error",
];

const isStoreRequestDebugState = (
  debugState: StoreDebugState | null
): debugState is StoreRequestDebugState =>
  !!debugState && storeRequestDebugStates.includes(debugState as StoreRequestDebugState);

function StoreStatusPanel({
  status,
  error,
  isFetching,
  onRetry,
  markerStatus,
  floating,
  debugState,
}: {
  status: StoreFetchStatus;
  error: AxiosError<ApiErrorBody> | null;
  isFetching: boolean;
  onRetry: () => void;
  markerStatus: MarkerRuntimeStatus;
  floating: boolean;
  debugState: StoreDebugState | null;
}) {
  if (status === "error" && isStoreRequestDebugState(debugState)) {
    return null;
  }

  if (
    !debugState &&
    status === "success" &&
    ["idle", "success", "rendering"].includes(markerStatus.status)
  ) {
    return null;
  }

  const activeDebugState =
    debugState ||
    (status === "loading"
      ? "store-loading"
      : status === "empty"
      ? "store-empty"
      : markerStatus.status === "empty"
      ? "marker-empty"
      : markerStatus.status === "partial-marker-error"
      ? "marker-partial-error"
      : markerStatus.status === "marker-error"
      ? "marker-error"
      : null);
  const isMarkerDebugState = ["marker-empty", "marker-partial-error", "marker-error"].includes(
    activeDebugState || ""
  );
  const copy = activeDebugState ? getStoreStatusCopy(activeDebugState) : null;
  const displayStatus =
    isMarkerDebugState
      ? "success"
      : activeDebugState === "store-loading"
      ? "loading"
      : activeDebugState === "store-empty"
      ? "empty"
      : ["store-database-delay", "store-network-error", "store-api-error"].includes(
          activeDebugState || ""
        )
      ? "error"
      : status;
  const className = floating
    ? "absolute right-4 top-4 z-10 w-[min(calc(100vw-2rem),360px)] rounded-md border border-[rgba(15,143,138,0.18)] bg-white/95 p-4 text-sm text-gray-700 shadow-sm"
    : "mx-auto mt-4 w-[min(calc(100vw-2rem),520px)] rounded-md border border-[rgba(15,143,138,0.18)] bg-white p-4 text-sm text-gray-700 shadow-sm";

  return (
    <div className={className}>
      {displayStatus === "loading" && (
        <div className="text-center" role="status" aria-live="polite">
          <Loader className="my-0 mb-4" />
          <p className="font-semibold text-[--color-signature-dark]">{copy?.title}</p>
          {copy?.message && <p className="mt-2">{copy.message}</p>}
          {showRuntimeDebugState && activeDebugState && (
            <p className="mt-2 rounded bg-[--color-signature-soft] px-2 py-1 text-xs text-[--color-signature-dark]">
              debug: {activeDebugState}
            </p>
          )}
        </div>
      )}

      {displayStatus === "error" && (
        <div role="alert" aria-live="assertive">
          <p className="font-semibold text-gray-900">{copy?.title}</p>
          {copy?.message && <p className="mt-2">{copy.message}</p>}
          {showRuntimeDebugState && activeDebugState && (
            <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
              debug: {activeDebugState}
              {error?.response?.status ? ` / status ${error.response.status}` : ""}
            </p>
          )}
          <button
            type="button"
            onClick={onRetry}
            disabled={isFetching}
            className="mt-3 rounded-md bg-[--color-signature] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-signature] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isFetching ? "다시 불러오는 중" : "다시 시도"}
          </button>
        </div>
      )}

      {displayStatus === "empty" && (
        <div role="status" aria-live="polite">
          <p className="font-semibold text-gray-900">{copy?.title}</p>
          {copy?.message && <p className="mt-2">{copy.message}</p>}
          {activeDebugState === "store-empty" && (
            <Link
              href="/stores/new"
              className="mt-3 inline-flex rounded-md bg-[--color-signature] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-signature] focus-visible:ring-offset-2"
            >
              맛집 등록하기
            </Link>
          )}
        </div>
      )}

      {activeDebugState === "marker-empty" && (
        <div role="status" aria-live="polite">
          <p className="font-semibold text-gray-900">{copy?.title}</p>
          <p className="mt-2">{copy?.message || markerStatus.message}</p>
          {showRuntimeDebugState && (
            <p className="mt-2 rounded bg-[--color-signature-soft] px-2 py-1 text-xs text-[--color-signature-dark]">
              debug: marker-empty
            </p>
          )}
        </div>
      )}

      {["marker-partial-error", "marker-error"].includes(activeDebugState || "") && (
        <div role="alert" aria-live="assertive">
          <p className="font-semibold text-gray-900">{copy?.title}</p>
          <p className="mt-2">
            {markerStatus.message ||
              `${markerStatus.rendered}개 표시, ${markerStatus.failed}개 실패`}
          </p>
          {copy?.message && <p className="mt-1">{copy.message}</p>}
          {showRuntimeDebugState && activeDebugState && (
            <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
              debug: {activeDebugState} / rendered {markerStatus.rendered} / failed{" "}
              {markerStatus.failed}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StoreErrorToast({
  debugState,
  error,
  isFetching,
  onRetry,
  tone = "critical",
}: {
  debugState: StoreDebugState | null;
  error: AxiosError<ApiErrorBody> | null;
  isFetching: boolean;
  onRetry: () => void;
  tone?: FallbackTone;
}) {
  if (!isStoreRequestDebugState(debugState)) {
    return null;
  }

  const activeDebugState = debugState;
  const copy = getStoreStatusCopy(activeDebugState);
  const isWarning = tone === "warning";
  const toneClassNames = fallbackToneClasses[tone];
  const title = isWarning ? "가게 정보를 잠시 불러오지 못했습니다." : copy.title;
  const message = isWarning
    ? "지도는 사용할 수 있지만 맛집 목록과 위치 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    : copy.message;
  const containerClassName = `fixed right-4 top-[calc(var(--navbar-height)+16px)] z-50 w-[min(calc(100vw-2rem),360px)] rounded-md border bg-white p-4 text-sm text-gray-700 shadow-lg ${toneClassNames.toastBorder}`;
  const debugClassName = `mt-2 rounded px-2 py-1 text-xs ${toneClassNames.debug}`;

  return (
    <aside
      className={containerClassName}
      role={isWarning ? "status" : "alert"}
      aria-live={isWarning ? "polite" : "assertive"}
    >
      <p className="font-semibold text-gray-900">{title}</p>
      {message && <p className="mt-2">{message}</p>}
      {showRuntimeDebugState && (
        <p className={debugClassName}>
          debug: {activeDebugState}
          {error?.response?.status ? ` / status ${error.response.status}` : ""}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className={`mx-auto mt-3 flex rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 ${toneClassNames.retryButton}`}
      >
        {isFetching ? "다시 불러오는 중" : "다시 시도"}
      </button>
    </aside>
  );
}

function HomeRuntimeStatePreview({
  state,
  reason,
}: {
  state: Exclude<RuntimeUiState, "success">;
  reason: RuntimeDebugState | null;
}) {
  const copy = getRuntimeStateCopy(state);
  const isLoading = state === "loading";
  const isFailure = state === "failure";

  return (
    <section
      className="flex min-h-[calc(100dvh-var(--navbar-height))] items-center justify-center bg-slate-50 px-4"
      aria-label="디버그 상태 미리보기"
    >
      <div
        className={`w-full max-w-md rounded-md border bg-white p-5 text-center text-gray-700 shadow-sm ${
          isFailure ? "border-red-200" : "border-[rgba(15,143,138,0.18)]"
        }`}
        role={isFailure ? "alert" : "status"}
        aria-live={isFailure ? "assertive" : "polite"}
      >
        {isLoading && <Loader className="my-0 mb-4" />}
        <p className={`font-semibold ${isLoading ? "text-[--color-signature-dark]" : "text-gray-900"}`}>
          {copy.title}
        </p>
        {copy.message && <p className="mt-2 text-sm text-gray-600">{copy.message}</p>}
        {showRuntimeDebugState && (
          <p
            className={`mt-3 rounded px-2 py-1 text-xs ${
              isFailure
                ? "bg-red-50 text-red-700"
                : "bg-[--color-signature-soft] text-[--color-signature-dark]"
            }`}
          >
            debugState: {state}
            {reason ? ` / reason: ${reason}` : ""}
          </p>
        )}
      </div>
    </section>
  );
}

function MapFailureServiceGuide() {
  const toneClassNames = fallbackToneClasses.warning;

  return (
    <div className={`mt-4 border-t pt-4 ${toneClassNames.divider}`}>
      <p className="text-sm text-gray-600">
        지도는 열리지 않았지만 맛집 목록과 주요 서비스는 계속 이용할 수 있습니다.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        검색과 지역별 필터는 맛집 목록 페이지에서 이용해 주세요.
      </p>
    </div>
  );
}

function StoreListActionLink() {
  return (
    <Link
      href="/stores"
      className="rounded-md bg-[--color-signature] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-signature] focus-visible:ring-offset-2"
    >
      맛집 목록으로 이동
    </Link>
  );
}

function MapFailureDataUnavailableGuide() {
  const toneClassNames = fallbackToneClasses.critical;

  return (
    <div className={`mt-4 border-t pt-4 ${toneClassNames.divider}`}>
      <p className="text-sm text-gray-600">
        지도와 맛집 데이터를 모두 불러오지 못해 현재 탐색 기능이 제한됩니다.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        일시적인 문제일 수 있습니다. 잠시 후 지도와 가게 정보를 다시 시도해 주세요.
      </p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const queryDebugState = getDebugStateFromQuery(router.query.debugState);
  const queryDebugReason = getDebugReasonFromQuery(router.query.debugReason);
  const isDebugPreview = !!queryDebugState && queryDebugState !== "success";
  const [mapStatus, setMapStatus] = useState<MapRuntimeStatus>(initialMapStatus);
  const [markerStatus, setMarkerStatus] =
    useState<MarkerRuntimeStatus>(initialMarkerStatus);

  const {
    data,
    error,
    isError,
    isFetching,
    isLoading,
    isSuccess,
    refetch,
  } = useQuery<StoreApiResponse, AxiosError<ApiErrorBody>>(
    ["home-stores"],
    fetchHomeStores,
    {
      enabled: !isDebugPreview,
      retry: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const stores = useMemo(() => data?.data ?? [], [data?.data]);
  const storeStatus: StoreFetchStatus = isLoading
    ? "loading"
    : isError
    ? "error"
    : isSuccess && stores.length === 0
    ? "empty"
    : "success";
  const mapDebugState = isMapDebugState(queryDebugReason) ? queryDebugReason : null;
  const queryStoreDebugState = isStoreDebugState(queryDebugReason) ? queryDebugReason : null;
  const storeDebugState =
    queryStoreDebugState || (isError ? getStoreDebugState(error ?? null) : null);

  const handleMapStatusChange = useCallback((status: MapRuntimeStatus) => {
    setMapStatus(status);
  }, []);

  const handleMarkerStatusChange = useCallback((status: MarkerRuntimeStatus) => {
    setMarkerStatus(status);
  }, []);

  const retryStoreFetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const mapFailed =
    mapStatus.sdk === "missing-env" ||
    mapStatus.sdk === "error" ||
    mapStatus.sdk === "timeout" ||
    mapStatus.map === "map-error";
  const mapAvailable = mapStatus.sdk === "ready" && mapStatus.map === "ready";
  const canRenderMarkers = mapAvailable && storeStatus === "success";
  const showMapFailureServiceGuide = mapFailed && storeStatus === "success";
  const showMapFailureDataUnavailableGuide = mapFailed && storeStatus === "error";
  const useFloatingStoreStatus = !mapFailed;
  const mapFailureTone: FallbackTone = showMapFailureDataUnavailableGuide ? "critical" : "warning";
  const storeErrorTone: FallbackTone = mapAvailable ? "warning" : "critical";

  return (
    <>
      <Head>
        <meta
          name="description"
          content="위치 기반으로 맛집을 탐색하고, 사용자가 직접 맛집을 등록하며 좋아요와 댓글로 기록을 남길 수 있는 맛집 지도 서비스입니다."
        />
      </Head>
      <main className="relative min-h-[calc(100dvh-var(--navbar-height))] bg-slate-50">
        {isDebugPreview && (
          <HomeRuntimeStatePreview state={queryDebugState} reason={queryDebugReason} />
        )}
        {!isDebugPreview && (
          <>
            <Map
              onStatusChange={handleMapStatusChange}
              debugState={mapDebugState}
              failureFallbackContent={
                showMapFailureServiceGuide ? (
                  <MapFailureServiceGuide />
                ) : showMapFailureDataUnavailableGuide ? (
                  <MapFailureDataUnavailableGuide />
                ) : null
              }
              failureActionContent={
                showMapFailureServiceGuide ? <StoreListActionLink /> : null
              }
              failureTone={mapFailureTone}
            />
            {canRenderMarkers && (
              <Markers stores={stores} onStatusChange={handleMarkerStatusChange} />
            )}
            <StoreErrorToast
              debugState={storeDebugState}
              error={error ?? null}
              isFetching={isFetching}
              onRetry={retryStoreFetch}
              tone={storeErrorTone}
            />
            <StoreStatusPanel
              status={storeStatus}
              error={error ?? null}
              isFetching={isFetching}
              onRetry={retryStoreFetch}
              markerStatus={markerStatus}
              floating={useFloatingStoreStatus}
              debugState={storeDebugState}
            />
            {mapAvailable && <StoreBox />}
            {mapAvailable && <CurrentPosition />}
          </>
        )}
      </main>
    </>
  );
}
