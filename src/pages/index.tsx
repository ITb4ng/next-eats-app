import axios, { AxiosError } from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";

import Map, { type MapRuntimeStatus } from "../components/Map";
import Markers, { type MarkerRuntimeStatus } from "../components/Markers";
import { StoreApiResponse, StoreType } from "../interface";

type StoreFetchStatus = "loading" | "success" | "empty" | "error";

const CurrentPosition = dynamic(() => import("../components/CurrentPosition"), {
  ssr: false,
});
const StoreBox = dynamic(() => import("../components/StoreBox"), {
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

const getStoreErrorMessage = (error: AxiosError<ApiErrorBody> | null) => {
  if (isDatabaseDelayLikeError(error)) {
    return "데이터베이스 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error?.response?.data?.message || "가게 정보를 불러오지 못했습니다.";
};

function StoreStatusPanel({
  status,
  error,
  isFetching,
  onRetry,
  markerStatus,
  floating,
}: {
  status: StoreFetchStatus;
  error: AxiosError<ApiErrorBody> | null;
  isFetching: boolean;
  onRetry: () => void;
  markerStatus: MarkerRuntimeStatus;
  floating: boolean;
}) {
  if (status === "success" && ["idle", "success", "rendering"].includes(markerStatus.status)) {
    return null;
  }

  const className = floating
    ? "absolute right-4 top-4 z-10 w-[min(calc(100vw-2rem),360px)] rounded-md border border-gray-200 bg-white/95 p-4 text-sm text-gray-700 shadow-sm"
    : "mx-auto mt-4 w-[min(calc(100vw-2rem),520px)] rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm";

  return (
    <div className={className}>
      {status === "loading" && (
        <div role="status" aria-live="polite">
          <p className="font-semibold text-gray-900">가게 정보를 불러오는 중입니다.</p>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      )}

      {status === "error" && (
        <div role="alert" aria-live="assertive">
          <p className="font-semibold text-gray-900">가게 정보를 불러오지 못했습니다.</p>
          <p className="mt-2">{getStoreErrorMessage(error)}</p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isFetching}
            className="mt-3 rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isFetching ? "다시 불러오는 중" : "다시 시도"}
          </button>
        </div>
      )}

      {status === "empty" && (
        <p role="status" aria-live="polite" className="font-semibold text-gray-900">
          등록된 가게가 없습니다.
        </p>
      )}

      {status === "success" && markerStatus.status === "empty" && (
        <p role="status" aria-live="polite" className="font-semibold text-gray-900">
          {markerStatus.message || "지도는 정상적으로 불러왔지만 표시할 위치 정보가 없습니다."}
        </p>
      )}

      {status === "success" &&
        ["partial-marker-error", "marker-error"].includes(markerStatus.status) && (
          <div role="alert" aria-live="assertive">
            <p className="font-semibold text-gray-900">
              {markerStatus.status === "partial-marker-error"
                ? "일부 위치를 표시하지 못했습니다."
                : "가게 위치를 표시하지 못했습니다."}
            </p>
            <p className="mt-2">
              {markerStatus.message ||
                `${markerStatus.rendered}개 표시, ${markerStatus.failed}개 실패`}
            </p>
          </div>
        )}
    </div>
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

export default function Home() {
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
      retry: false,
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
  const canRenderMarkers = storeStatus === "success" || storeStatus === "empty";
  const showListFallback = mapFailed && storeStatus === "success" && stores.length > 0;
  const useFloatingStoreStatus = !mapFailed;

  return (
    <main className="relative min-h-[calc(100dvh-var(--navbar-height))] bg-slate-50">
      <Map
        onStatusChange={handleMapStatusChange}
        presentation={showListFallback ? "compact" : "fullscreen"}
      />
      {canRenderMarkers && (
        <Markers stores={stores} onStatusChange={handleMarkerStatusChange} />
      )}
      <StoreStatusPanel
        status={storeStatus}
        error={error ?? null}
        isFetching={isFetching}
        onRetry={retryStoreFetch}
        markerStatus={markerStatus}
        floating={useFloatingStoreStatus}
      />
      {showListFallback && <StoreListFallback stores={stores} />}
      {mapAvailable && <StoreBox />}
      {mapAvailable && <CurrentPosition />}
    </main>
  );
}
