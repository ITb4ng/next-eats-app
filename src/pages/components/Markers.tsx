// import { currentStoreState, mapState } from "@/atom";
import { StoreType } from "@/interface";
import { useEffect, useCallback } from "react";
import { useMapStore } from "@/zustand";
// import { useRecoilValue, useSetRecoilState } from "recoil";
interface MarkersProps {
    stores: StoreType[];
}

export default function Markers({ stores } : MarkersProps){
  const map = useMapStore((state) => state.map);
  const setCurrentStore = useMapStore((state) => state.setCurrentStore);
    const loadKakaoMarkers = useCallback(() => {
        if(map){
            stores?.map((store) =>{
                var imageSrc = store?.category 
                  ? `/images/markers/${store?.category}.png` // 이미지 경로
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
                
                window.kakao.maps.event.addListener(marker, 'click', function() {
                  // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
                  setCurrentStore(store);
                });

              });
        }
    }, [map, stores, setCurrentStore]);
    
        useEffect(() => {
          loadKakaoMarkers();
    }, [loadKakaoMarkers, map])
  return <></>;
}