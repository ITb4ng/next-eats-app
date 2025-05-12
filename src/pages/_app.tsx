import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./components/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools} from "react-query/devtools";
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from 'react-toastify';
import Head from "next/head";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { session } = pageProps
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>우아한맛집들</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
          {/* <ToastContainer /> */}
        </Layout>
        <ReactQueryDevtools />
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
