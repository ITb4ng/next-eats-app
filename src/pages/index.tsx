import { useState} from "react";
import Map from "./components/Map";
import Markers from "./components/Markers";

import * as stores from "@/data/test.json";
import StoreBox from "./components/StoreBox";

export default function Home() {
  const [map, setMap] = useState(null);
  const [currentStore, setCurrentStore] = useState(null);
  const storeDatas = stores["DATA"];

  console.log(currentStore);
  return (
  <>
    <Map setMap={setMap} />
    <Markers 
    storeDatas={storeDatas} 
    map ={map} 
    setCurrentStore = {setCurrentStore}/>
    <StoreBox store={currentStore} setStore={setCurrentStore} />
  </>
  
  );
}