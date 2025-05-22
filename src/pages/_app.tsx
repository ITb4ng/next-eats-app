import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
          <ToastContainer autoClose={500} pauseOnFocusLoss={false} pauseOnHover={false} />
        </Layout>
        <ReactQueryDevtools />
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
