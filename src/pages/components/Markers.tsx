import { useEffect, Dispatch, SetStateAction, useCallback } from "react";

interface MarkersProps {
    map: any;
    storeDatas: any[];
    setCurrentStore: Dispatch<SetStateAction<any>>;
}

export default function Markers({
  map, 
  storeDatas,
  setCurrentStore,
 } : MarkersProps){
    const loadKakaoMarkers = useCallback(() => {
        if(map){
            storeDatas?.map((store) =>{
                var imageSrc = store?.bizcnd_code_nm 
                  ? `/images/markers/${store?.bizcnd_code_nm}.png` // 이미지 경로
                  : "/images/markers/default.png",
                  imageSize = new window.kakao.maps.Size(40, 40), // 이미지 마커 기본 크기입니다
                  imageOption = {offset: new window.kakao.maps.Point(27, 69)}; // 오프셋 설정
                    
                // 마커의 이미지정보 생성
                var markerImage = new window.kakao.maps.MarkerImage(
                  imageSrc, 
                  imageSize, 
                  imageOption
                );
                // 마커 이미지 정보의 좌표값;
                var makerPosition = new window.kakao.maps.LatLng(
                  store?.y_dnts,
                  store?.x_cnts
                );
    
                // 마커를 생성
                var marker = new window.kakao.maps.Marker({
                    position: makerPosition, 
                    // 마커이미지 설정 
                    image: markerImage,
                });
                
                marker.setMap(map);
    
    
                var content = `<div class="infowindow">${store?.upso_nm}</div>`;
    
                var customOverlay = new window.kakao.maps.CustomOverlay({
                  position: makerPosition,
                  content: content, 
                  xAnchor: 0.6,
                  yAnchor: 0.91,
                });
    
                  // 마커에 마우스오버 이벤트를 등록합니다
                window.kakao.maps.event.addListener(marker, 'mouseover', function() {
                  // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
                  customOverlay.setMap(map);
                });
    
                  // 마커에 마우스아웃 이벤트를 등록합니다
                window.kakao.maps.event.addListener(marker, 'mouseout', function() {
                  // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                  customOverlay.setMap(null);
                });
                
                window.kakao.maps.event.addListener(marker, 'click', function() {
                  // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                  setCurrentStore(store);
                });

              });
        }
    },[map, 
      storeDatas,
      setCurrentStore]);
    
    useEffect(() => {
      loadKakaoMarkers();
 }, [loadKakaoMarkers, map])
 return <></>;
}