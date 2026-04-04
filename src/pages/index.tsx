import CurrentPosition from "../components/CurrentPosition";
import Map from "../components/Map";
import Markers from "../components/Markers";
import StoreBox from "../components/StoreBox";
import { StoreType } from "../interface";
import prisma from "@/db";

export default function Home({ stores }: { stores: StoreType[] }) {
  return (
    <>
      <Map />
      <Markers stores={stores} />
      <StoreBox />
      <CurrentPosition />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { id: "desc" },
    });

    return {
      props: {
        stores: stores.map((store) => ({
          ...store,
          lat: store.lat ?? null,
          lng: store.lng ?? null,
        })),
      },
    };
  } catch (error) {
    console.error("Home page store load error:", error);

    return {
      props: { stores: [] },
    };
  }
}