import { Dispatch, SetStateAction } from "react";
import Script from "next/script";

//import * as stores from '@/data/store_data.json'; 서울 공공 데이터 
//import * as stores from '@/data/store_data_upso.json'; 춘천 공공 데이터

declare global {
    interface Window {
        kakao : any;
    }
}
interface MapProps {
  setMap: Dispatch<SetStateAction<any>>;
  lat?  : string | null;
  lng?  : string | null;
  zoom? : number;
}

// 춘천 const DEFAULT_LAT = 37.8689472;
// const DEFAULT_LNG = 127.72065;


// const DEFAULT_LAT = 37.64308901450529; 
// const DEFAULT_LNG = 127.3281682502683;

const DEFAULT_LAT = 37.7777; 
const DEFAULT_LNG = 127.23456;

const DEFAULT_ZOOM_LEVEL = 10;

export default function Map({setMap, lat, lng, zoom}: MapProps) {
    const loadkakaomap = () => {
        //Kakao map load
        window.kakao.maps.load(function() {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(
              lat ?? DEFAULT_LAT, 
              lng ?? DEFAULT_LNG
            ),
            level: zoom ?? DEFAULT_ZOOM_LEVEL
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          const marker = new window.kakao.maps.Marker({ 
            // 지도 중심좌표에 마커를 생성합니다 
            position: map.getCenter() 
        }); 
          setMap(map);
          marker.setMap(map);
          window.kakao.maps.event.addListener(map, 'click', function(e: { latLng: any; }) {        
    
            // 클릭한 위도, 경도 정보를 가져옵니다 
            const latlng = e.latLng; 
            
            // 마커 위치를 클릭한 위치로 옮깁니다
            marker.setPosition(latlng);
            
            let message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
            message += '경도는 ' + latlng.getLng() + ' 입니다';
            
            const resultDiv = document.getElementById('clickLatlng'); 
            // resultDiv.innerHTML = message;
            // console.log(message);
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