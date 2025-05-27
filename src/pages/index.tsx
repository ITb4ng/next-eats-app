import Map from "../components/Map";
import Markers from "../components/Markers";

import StoreBox from "../components/StoreBox";
import { StoreType } from "../interface";

import axios from "axios";
import CurrentPosition from "../components/CurrentPosition";
import prisma from "@/db";

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
    const res = await axios(`${process.env.NEXT_PUBLIC_API_URL}/api/stores`);
    return {
      props: { stores: res.data.data },
      
    };
    
  } catch (error) {
    console.error('에러', error);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    return {
      props: { stores: [] }, // 오류 발생 시 빈 배열 반환
    };
  }
}