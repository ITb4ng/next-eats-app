import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from 'react-toastify';
import Head from "next/head";

const queryClient = new QueryClient();
const ReactQueryDevtools = dynamic(
  () => import("react-query/devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);
const showReactQueryDevtools = process.env.NODE_ENV !== "production";

export default function App({ Component, pageProps }: AppProps) {
  const { session } = pageProps
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>우아한맛집들</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
          <ToastContainer autoClose={500} pauseOnFocusLoss={false} pauseOnHover={false} />
        </Layout>
        {showReactQueryDevtools && <ReactQueryDevtools />}
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
