import axios, { AxiosError } from "axios";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";

import Map, { type MapRuntimeStatus } from "../components/Map";
import type { MarkerRuntimeStatus } from "../components/Markers";
import { StoreApiResponse, StoreType } from "../interface";
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
}: {
  debugState: StoreDebugState | null;
  error: AxiosError<ApiErrorBody> | null;
  isFetching: boolean;
  onRetry: () => void;
}) {
  if (!isStoreRequestDebugState(debugState)) {
    return null;
  }

  const activeDebugState = debugState;
  const copy = getStoreStatusCopy(activeDebugState);

  return (
    <aside
      className="fixed left-4 right-4 top-[calc(var(--navbar-height)+12px)] z-50 rounded-md border border-red-200 bg-white p-4 text-sm text-gray-700 shadow-lg sm:left-auto sm:right-4 sm:top-[calc(var(--navbar-height)+16px)] sm:w-[min(calc(100vw-2rem),360px)]"
      role="alert"
      aria-live="assertive"
    >
      <p className="font-semibold text-gray-900">{copy.title}</p>
      {copy.message && <p className="mt-2">{copy.message}</p>}
      {showRuntimeDebugState && (
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
    </aside>
  );
}

function StoreListFallback({ stores }: { stores: StoreType[] }) {
  if (stores.length === 0) return null;

  return (
    <section className="bg-slate-50 px-4 pb-8 sm:px-6 lg:px-8" aria-labelledby="fallback-store-list">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="fallback-store-list" className="text-lg font-bold text-gray-900">
              지도 없이 가게 목록 보기
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              지도는 열리지 않았지만 등록된 가게 정보는 계속 확인할 수 있습니다.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-500">{stores.length}개 가게</p>
        </div>

        <div className="max-h-[65dvh] overflow-y-auto pr-1">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stores.slice(0, 10).map((store) => (
              <li key={store.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{store.name || "이름 없는 가게"}</p>
                    <p className="mt-1 text-sm text-gray-600">{store.address || "주소 정보가 없습니다."}</p>
                  </div>
                  {store.category && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {store.category}
                    </span>
                  )}
                </div>
                <Link
                  href={`/stores/${store.id}`}
                  className="mt-3 inline-flex text-sm font-semibold text-[--color-signature-dark] hover:underline"
                >
                  상세 보기
                </Link>
              </li>
            ))}
          </ul>
          {stores.length > 10 && (
            <p className="mt-4 text-sm text-gray-500">
              처음 10개만 표시 중입니다. 전체 목록은{" "}
              <Link
                href="/stores"
                className="font-semibold text-[--color-signature-dark] underline underline-offset-2 hover:text-[--color-signature]"
              >
                맛집 목록
              </Link>
              에서 확인할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </section>
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
  const showListFallback = mapFailed && storeStatus === "success" && stores.length > 0;
  const useFloatingStoreStatus = !mapFailed;

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
              presentation={showListFallback ? "compact" : "fullscreen"}
              debugState={mapDebugState}
            />
            {canRenderMarkers && (
              <Markers stores={stores} onStatusChange={handleMarkerStatusChange} />
            )}
            <StoreErrorToast
              debugState={storeDebugState}
              error={error ?? null}
              isFetching={isFetching}
              onRetry={retryStoreFetch}
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
            {showListFallback && <StoreListFallback stores={stores} />}
            {mapAvailable && <StoreBox />}
            {mapAvailable && <CurrentPosition />}
          </>
        )}
      </main>
    </>
  );
}
