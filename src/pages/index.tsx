import Map from "../components/Map";
import Markers from "../components/Markers";

import StoreBox from "../components/StoreBox";
import { StoreType } from "../interface";

import axios from "axios";
import CurrentPosition from "../components/CurrentPosition";

export default function Home({ stores }: { stores: StoreType[] }) {
  return (
    <>
      <Map />
      <Markers stores={stores} />
      <StoreBox />
      <CurrentPosition/>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const stores = await axios(`${process.env.NEXT_PUBLIC_API_URL}/api/stores`);
    return {
      props: { stores: stores.data },
    };
  } catch (error) {
    console.error('에러', error);
    return {
      props: { stores: [] }, // 오류 발생 시 빈 배열 반환
    };
  }
}