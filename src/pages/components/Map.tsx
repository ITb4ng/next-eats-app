import Script from "next/script";

declare global {
    interface Window {
        kakao : any;
    }
}

export default function Map() {
    const loadkakaomap = () => {
        //Kakao map laod
        window.kakao.maps.load(function() {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(37.8689472, 127.72065),
            level: 3,
          };
          new window.kakao.maps.Map(mapContainer, mapOption);
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