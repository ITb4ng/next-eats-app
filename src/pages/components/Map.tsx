import Script from "next/script";
//서울 공공 데이터 import * as stores from '@/data/store_data.json';

//춘천 공공 데이터 import * as stores from '@/data/store_data_upso.json';
import * as stores from '@/data/test.json';
// import { Dispatch, SetStateAction } from "react";

declare global {
    interface Window {
        kakao : any;
    }
}

// 우리 집const DEFAULT_LAT = 37.8689472;
// const DEFAULT_LNG = 127.72065;
const DEFAULT_LAT = 37.64308901450529; 
const DEFAULT_LNG = 127.3281682502683;

export default function Map() {
    const loadkakaomap = () => {
        //Kakao map laod
        window.kakao.maps.load(function() {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
            level: 9,
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);

          stores?.["DATA"]?.map((store) =>{
            var makerPosition = new window.kakao.maps.LatLng(
              store?.y_dnts,
              store?.x_cnts
            );

            //마커 생성

            var marker = new window.kakao.maps.Marker({
              position: makerPosition,
            });
            
            marker.setMap(map);
          });
        });
      };
    return (
        <>
          <Script
        strategy="afterInteractive"
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&autoload=false`}
        onReady={loadkakaomap}
        />
        <div id="map" className="w-full h-screen"></div>
        </>
    );  
}