import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react"
import Head from "next/head";

const queryClient = new QueryClient();
const showReactQueryDevtools = process.env.NODE_ENV !== "production";
const ReactQueryDevtools = showReactQueryDevtools
  ? dynamic(
      () => import("react-query/devtools").then((mod) => mod.ReactQueryDevtools),
      { ssr: false }
    )
  : null;
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  const { session } = pageProps
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon-32x32.png?v=20260519" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.svg?v=20260519" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=20260519" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260519" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://dapi.kakao.com" />
        <link rel="preconnect" href="https://t1.daumcdn.net" />
        <title>우아한맛집들</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2ac1bc" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
          <ToastContainer autoClose={500} pauseOnFocusLoss={false} pauseOnHover={false} />
        </Layout>
        {ReactQueryDevtools && <ReactQueryDevtools />}
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
