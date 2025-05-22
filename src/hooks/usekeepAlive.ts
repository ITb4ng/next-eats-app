// src/hooks/useKeepAlive.ts
import { useEffect } from "react";

export default function useKeepAlive(interval: number = 5 * 60 * 1000) {
  useEffect(() => {
    const ping = () => {
      fetch("/api/ping").catch((e) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Ping failed:", e);
        }
      });
    };

    ping(); // 페이지 처음 로드 시 즉시 1회 실행
    const id = setInterval(ping, interval); // 이후 주기적으로 ping

    return () => clearInterval(id); // 컴포넌트 unmount 시 정리
  }, [interval]);
}
