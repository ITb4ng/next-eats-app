import { StoreType } from "@/interface";
import { useEffect, Dispatch, SetStateAction, useCallback } from "react";

interface MarkersProps {
    map: any;
    store: StoreType;
}

export default function Marker({
  map, 
  store
 } : MarkersProps){
    const loadKakaoMarker = useCallback(() => {
        if(map && store){ //루트 MAP의 Markers에서 선택한 store'한개만' 마커 보여주기
                var imageSrc = store?.category 
                  ? `/images/markers/${store?.category}.png` // 이미지 경로
                  : "/images/markers/default.png",
                  imageSize = new window.kakao.maps.Size(40, 40), // 이미지 마커 기본 크기입니다
                  imageOption = {offset: new window.kakao.maps.Point(24, 59)}; // 오프셋 설정
                    
                // 마커의 이미지정보 생성
                var markerImage = new window.kakao.maps.MarkerImage(
                  imageSrc, 
                  imageSize, 
                  imageOption
                );
                // 마커 이미지 정보의 좌표값;
                var makerPosition = new window.kakao.maps.LatLng(
                  store?.lat,
                  store?.lng,
                );
    
                // 마커를 생성
                var marker = new window.kakao.maps.Marker({
                    position: makerPosition, 
                    // 마커이미지 설정 
                    image: markerImage,
                });
                
                marker.setMap(map);
    
    
                var content = `<div class="infowindow">${store?.name}</div>`;
    
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
            }
    }, [map, store]);
    
    useEffect(() => {
      loadKakaoMarker();
 }, [loadKakaoMarker, map])
 return <></>;
}