import { execFileSync, spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const runtimePort = process.env.PERF_TEST_PORT || "3210";
const rootUrl = process.env.PERF_TEST_BASE_URL || `http://127.0.0.1:${runtimePort}`;
const runtimeDb = process.argv.includes("--runtime-db");
const browserSdk = process.argv.includes("--browser-sdk");
const expectedCodes = [
  "DB_STORES_UNAVAILABLE",
  "STORE_API_ERROR",
  "KAKAO_MAP_SDK_MISSING_CONFIG",
  "KAKAO_MAP_SDK_SCRIPT_ERROR",
  "KAKAO_MAP_SDK_TIMEOUT",
  "KAKAO_MAP_SDK_INIT_ERROR",
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const readSource = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const checkLogContracts = async () => {
  const storesApi = await readSource("src/pages/api/stores.ts");
  const sdkHook = await readSource("src/hooks/useKakaoMapSdk.ts");
  const missing = expectedCodes.filter(
    (code) => !storesApi.includes(code) && !sdkHook.includes(code)
  );

  assert(
    missing.length === 0,
    `Operational log codes are missing from source: ${missing.join(", ")}`
  );

  console.log("[perf:v1.1.0] operational log contract ok");
};

const waitForServer = async (url, timeoutMs = 30000) => {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < 500 || response.status === 503) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not become reachable: ${lastError?.message ?? "timeout"}`);
};

const checkDbDisconnectedRuntime = async () => {
  const output = [];
  const child = spawn("npm", ["run", "dev", "--", "-p", runtimePort], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/invalid?connect_timeout=1",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));

  try {
    await waitForServer(rootUrl);
    const response = await fetch(`${rootUrl}/api/stores`);
    const body = await response.text();
    const logText = output.join("");

    assert(
      response.status === 503,
      `Expected /api/stores to return 503, got ${response.status}. Body: ${body.slice(
        0,
        300
      )}. Logs: ${logText.slice(-1000)}`
    );
    assert(
      logText.includes("[ops:DB_STORES_UNAVAILABLE]"),
      "Expected DB_STORES_UNAVAILABLE operational log in dev server output"
    );

    console.log("[perf:v1.1.0] db disconnected runtime check ok");
    console.log(`[perf:v1.1.0] response body: ${body.slice(0, 160)}`);
  } finally {
    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          stdio: "ignore",
          windowsHide: true,
        });
      } catch {
        // The dev server may already be gone after the runtime check finishes.
      }
    } else {
      child.kill();
    }
  }
};

const checkSdkBrowserRuntime = async () => {
  let chromium;

  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.log("[perf:v1.1.0] skipped sdk browser check: install playwright first");
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.route("https://dapi.kakao.com/**", (route) => route.abort());
  await page.goto(rootUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(12000);
  await browser.close();

  assert(
    errors.some((message) => message.includes("[ops:KAKAO_MAP_SDK_SCRIPT_ERROR]")),
    "Expected KAKAO_MAP_SDK_SCRIPT_ERROR console log when Kakao SDK request fails"
  );

  console.log("[perf:v1.1.0] sdk browser runtime check ok");
};

const main = async () => {
  await checkLogContracts();

  if (runtimeDb) {
    await checkDbDisconnectedRuntime();
  }

  if (browserSdk) {
    await checkSdkBrowserRuntime();
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
