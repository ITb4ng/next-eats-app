export type OperationalErrorCode =
  | "DB_STORES_UNAVAILABLE"
  | "STORE_API_ERROR"
  | "KAKAO_MAP_SDK_MISSING_CONFIG"
  | "KAKAO_MAP_SDK_TIMEOUT"
  | "KAKAO_MAP_SDK_INIT_ERROR"
  | "KAKAO_MAP_SDK_SCRIPT_ERROR";

type OperationalContext = Record<string, string | number | boolean | null | undefined>;

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code:
        typeof (error as Error & { code?: unknown }).code === "string"
          ? (error as Error & { code: string }).code
          : undefined,
    };
  }

  if (typeof error === "object" && error !== null) {
    const source = error as { message?: unknown; code?: unknown; name?: unknown };
    return {
      name: typeof source.name === "string" ? source.name : undefined,
      message: typeof source.message === "string" ? source.message : String(error),
      code: typeof source.code === "string" ? source.code : undefined,
    };
  }

  return {
    message: typeof error === "string" ? error : String(error),
  };
};

export const logOperationalError = (
  code: OperationalErrorCode,
  message: string,
  error?: unknown,
  context: OperationalContext = {}
) => {
  console.error(`[ops:${code}] ${message}`, {
    code,
    message,
    context,
    error: error === undefined ? undefined : normalizeError(error),
  });
};
