import { useCallback, useEffect, useMemo, useState } from "react";

import { logOperationalError, type OperationalErrorCode } from "@/lib/opsLogger";

type KakaoMapSdkErrorCode = Exclude<
  OperationalErrorCode,
  "DB_STORES_UNAVAILABLE" | "STORE_API_ERROR"
>;

export type KakaoMapSdkStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missing-env"
  | "timeout"
  | "error";

const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";
const KAKAO_MAP_SDK_TIMEOUT_MS = 10000;

const getKakaoMapAppKey = () => {
  const appKey =
    process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT ||
    "";

  return appKey.trim();
};

const getKakaoMapScriptSrc = (appKey: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
    appKey
  )}&autoload=false`;

export function useKakaoMapSdk() {
  const appKey = useMemo(getKakaoMapAppKey, []);
  const [status, setStatus] = useState<KakaoMapSdkStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<KakaoMapSdkErrorCode | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setDebugCode(null);
    setStatus("idle");
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    if (!appKey) {
      logOperationalError(
        "KAKAO_MAP_SDK_MISSING_CONFIG",
        "Kakao Map SDK app key is missing."
      );
      setStatus("missing-env");
      setErrorMessage("지도 설정값이 없습니다.");
      setDebugCode("KAKAO_MAP_SDK_MISSING_CONFIG");
      return;
    }

    let isActive = true;
    let isSettled = false;
    let scriptElement = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const finishReady = () => {
      if (!isActive || isSettled) return;
      isSettled = true;
      setErrorMessage(null);
      setStatus("ready");
    };

    const finishError = (
      message: string,
      code: KakaoMapSdkErrorCode,
      error?: unknown
    ) => {
      if (!isActive || isSettled) return;
      isSettled = true;
      logOperationalError(code, message, error, {
        retryCount,
        scriptStatus: scriptElement?.dataset.kakaoMapStatus,
      });
      setErrorMessage(message);
      setDebugCode(code);
      setStatus("error");
      if (scriptElement) {
        scriptElement.dataset.kakaoMapStatus = "error";
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (!isActive || isSettled) return;
      isSettled = true;
      logOperationalError(
        "KAKAO_MAP_SDK_TIMEOUT",
        "Kakao Map SDK response timed out.",
        undefined,
        { timeoutMs: KAKAO_MAP_SDK_TIMEOUT_MS, retryCount }
      );
      setErrorMessage("지도 SDK 응답 시간이 초과되었습니다.");
      setDebugCode("KAKAO_MAP_SDK_TIMEOUT");
      setStatus("timeout");
      if (scriptElement) {
        scriptElement.dataset.kakaoMapStatus = "timeout";
      }
    }, KAKAO_MAP_SDK_TIMEOUT_MS);

    const loadFromKakaoNamespace = () => {
      const maps = window.kakao?.maps;
      if (!maps?.load) return false;

      try {
        maps.load(finishReady);
        return true;
      } catch (error) {
        finishError(
          "지도 SDK 초기화에 실패했습니다.",
          "KAKAO_MAP_SDK_INIT_ERROR",
          error
        );
        return true;
      }
    };

    setStatus("loading");

    if (loadFromKakaoNamespace()) {
      return () => {
        isActive = false;
        window.clearTimeout(timeoutId);
      };
    }

    if (
      scriptElement?.dataset.kakaoMapStatus === "error" ||
      scriptElement?.dataset.kakaoMapStatus === "timeout"
    ) {
      scriptElement.remove();
      scriptElement = null;
    }

    const handleLoad = () => {
      if (scriptElement) {
        scriptElement.dataset.kakaoMapStatus = "loaded";
      }
      if (!loadFromKakaoNamespace()) {
        finishError(
          "지도 SDK를 확인할 수 없습니다.",
          "KAKAO_MAP_SDK_INIT_ERROR"
        );
      }
    };

    const handleError = () => {
      finishError(
        "지도 SDK 스크립트 로딩에 실패했습니다.",
        "KAKAO_MAP_SDK_SCRIPT_ERROR"
      );
    };

    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.id = KAKAO_MAP_SCRIPT_ID;
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.src = getKakaoMapScriptSrc(appKey);
      scriptElement.dataset.kakaoMapStatus = "loading";
      document.head.appendChild(scriptElement);
    }

    scriptElement.addEventListener("load", handleLoad);
    scriptElement.addEventListener("error", handleError);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      scriptElement?.removeEventListener("load", handleLoad);
      scriptElement?.removeEventListener("error", handleError);
    };
  }, [appKey, retryCount]);

  return {
    status,
    errorMessage,
    debugCode,
    retry,
  };
}
