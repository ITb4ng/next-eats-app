import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setStatus("idle");
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    if (!appKey) {
      setStatus("missing-env");
      setErrorMessage("지도 설정값이 없습니다.");
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

    const finishError = (message: string) => {
      if (!isActive || isSettled) return;
      isSettled = true;
      setErrorMessage(message);
      setStatus("error");
      if (scriptElement) {
        scriptElement.dataset.kakaoMapStatus = "error";
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (!isActive || isSettled) return;
      isSettled = true;
      setErrorMessage("지도 SDK 응답 시간이 초과되었습니다.");
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
        finishError(error instanceof Error ? error.message : "지도 SDK 초기화에 실패했습니다.");
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
        finishError("지도 SDK를 확인할 수 없습니다.");
      }
    };

    const handleError = () => {
      finishError("지도 SDK 스크립트 로딩에 실패했습니다.");
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
    retry,
  };
}
