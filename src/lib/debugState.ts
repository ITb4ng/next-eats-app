import type { OperationalErrorCode } from "@/lib/opsLogger";

export const showRuntimeDebugState = process.env.NODE_ENV === "development";

export type RuntimeUiState = "loading" | "empty" | "failure" | "success";

type MapOperationalErrorCode = Exclude<
  OperationalErrorCode,
  "DB_STORES_UNAVAILABLE" | "STORE_API_ERROR"
>;

export type StoreDebugState =
  | "store-loading"
  | "store-empty"
  | "store-database-delay"
  | "store-network-error"
  | "store-api-error"
  | "marker-empty"
  | "marker-partial-error"
  | "marker-error";

export type MapDebugState =
  | MapOperationalErrorCode
  | "KAKAO_MAP_CREATING"
  | "KAKAO_MAP_CREATE_ERROR"
  | "KAKAO_MAP_TILE_TIMEOUT";

export type RuntimeDebugState = StoreDebugState | MapDebugState;

export interface RuntimeCopy {
  title: string;
  message?: string;
}

const runtimeUiStates: RuntimeUiState[] = ["loading", "empty", "failure", "success"];

const storeDebugStates: StoreDebugState[] = [
  "store-loading",
  "store-empty",
  "store-database-delay",
  "store-network-error",
  "store-api-error",
  "marker-empty",
  "marker-partial-error",
  "marker-error",
];

const mapDebugStates: MapDebugState[] = [
  "KAKAO_MAP_SDK_MISSING_CONFIG",
  "KAKAO_MAP_SDK_TIMEOUT",
  "KAKAO_MAP_SDK_INIT_ERROR",
  "KAKAO_MAP_SDK_SCRIPT_ERROR",
  "KAKAO_MAP_CREATING",
  "KAKAO_MAP_CREATE_ERROR",
  "KAKAO_MAP_TILE_TIMEOUT",
];

export const isStoreDebugState = (value: unknown): value is StoreDebugState =>
  typeof value === "string" && storeDebugStates.includes(value as StoreDebugState);

export const isMapDebugState = (value: unknown): value is MapDebugState =>
  typeof value === "string" && mapDebugStates.includes(value as MapDebugState);

export const getDebugStateFromQuery = (
  value: string | string[] | undefined
): RuntimeUiState | null => {
  if (!showRuntimeDebugState) return null;

  const debugState = Array.isArray(value) ? value[0] : value;
  if (isRuntimeUiState(debugState)) {
    return debugState;
  }

  return null;
};

export const getDebugReasonFromQuery = (
  value: string | string[] | undefined
): RuntimeDebugState | null => {
  if (!showRuntimeDebugState) return null;

  const debugReason = Array.isArray(value) ? value[0] : value;
  if (isStoreDebugState(debugReason) || isMapDebugState(debugReason)) {
    return debugReason;
  }

  return null;
};

export const getRuntimeStateCopy = (state: RuntimeUiState): RuntimeCopy => {
  switch (state) {
    case "loading":
      return {
        title: "화면을 준비하는 중입니다.",
        message: "지도와 가게 정보를 불러오고 있습니다.",
      };
    case "empty":
      return {
        title: "등록된 가게가 없습니다.",
        message: "첫 번째 맛집을 등록하면 지도와 목록에 표시됩니다.",
      };
    case "failure":
      return {
        title: "정보를 불러오지 못했습니다.",
        message: "일시적인 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.",
      };
    case "success":
      return {
        title: "정상 상태입니다.",
        message: "지도와 가게 정보를 표시할 수 있는 상태입니다.",
      };
  }
};

export const getMapStatusCopy = (debugState: MapDebugState): RuntimeCopy => {
  switch (debugState) {
    case "KAKAO_MAP_SDK_MISSING_CONFIG":
      return {
        title: "지도 설정을 확인하고 있습니다.",
        message: "현재 지도 설정이 준비되지 않아 지도 화면을 표시하지 못했습니다.",
      };
    case "KAKAO_MAP_SDK_TIMEOUT":
      return {
        title: "지도 응답이 지연되고 있습니다.",
        message: "네트워크 상태나 지도 서비스 응답이 느립니다. 잠시 후 다시 시도해 주세요.",
      };
    case "KAKAO_MAP_SDK_SCRIPT_ERROR":
      return {
        title: "지도 서비스를 불러오지 못했습니다.",
        message: "일시적인 네트워크 문제일 수 있습니다. 다시 시도해 주세요.",
      };
    case "KAKAO_MAP_SDK_INIT_ERROR":
      return {
        title: "지도 초기화에 실패했습니다.",
        message: "지도 서비스 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      };
    case "KAKAO_MAP_CREATE_ERROR":
      return {
        title: "지도 화면을 준비하지 못했습니다.",
        message: "지도 화면을 만드는 중 문제가 발생했습니다. 다시 시도해 주세요.",
      };
    case "KAKAO_MAP_TILE_TIMEOUT":
      return {
        title: "지도 기본 화면은 열렸습니다.",
        message: "일부 지도 타일 응답이 느려 화면이 순차적으로 표시될 수 있습니다.",
      };
    case "KAKAO_MAP_CREATING":
      return {
        title: "지도 화면을 준비하는 중입니다.",
      };
    default:
      return {
        title: "지도를 불러오지 못했습니다.",
        message: "잠시 후 다시 시도해 주세요.",
      };
  }
};

export const getStoreStatusCopy = (debugState: StoreDebugState): RuntimeCopy => {
  switch (debugState) {
    case "store-loading":
      return {
        title: "가게 정보를 불러오는 중입니다.",
      };
    case "store-empty":
      return {
        title: "등록된 가게가 없습니다.",
        message: "첫 번째 맛집을 등록하면 지도와 목록에 표시됩니다.",
      };
    case "store-database-delay":
      return {
        title: "가게 데이터 응답이 지연되고 있습니다.",
        message: "잠시 후 다시 시도해 주세요.",
      };
    case "store-network-error":
      return {
        title: "네트워크 연결을 확인해 주세요.",
        message: "가게 정보를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
      };
    case "marker-empty":
      return {
        title: "표시할 위치 정보가 없습니다.",
        message: "지도는 정상적으로 열렸지만 위치 좌표가 있는 가게를 찾지 못했습니다.",
      };
    case "marker-partial-error":
      return {
        title: "일부 위치를 표시하지 못했습니다.",
        message: "가게 목록은 계속 확인할 수 있습니다.",
      };
    case "marker-error":
      return {
        title: "가게 위치를 표시하지 못했습니다.",
        message: "지도는 열렸지만 마커를 표시하는 중 문제가 발생했습니다.",
      };
    default:
      return {
        title: "가게 정보를 불러오지 못했습니다.",
        message: "잠시 후 다시 시도해 주세요.",
      };
  }
};
const isRuntimeUiState = (value: unknown): value is RuntimeUiState =>
  typeof value === "string" && runtimeUiStates.includes(value as RuntimeUiState);
