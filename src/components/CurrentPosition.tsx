import { useMapStore } from "@/zustand";
import { useState } from "react";
import { CiRoute } from "react-icons/ci";
import { toast } from "react-toastify";
import FullPageLoader from "./FullpageLoader";

export default function CurrentPosition () {
    const [loading, setLoading] = useState<boolean>(false);
    const map = useMapStore((state) => state.map);
    const handleCurrentPosition = () => {
        setLoading(true);

        const options = {
            enableHighAccuracy : false,
            timeout: 3000,
            maximumAge: Infinity,
        };
        if(navigator.geolocation && map){
            navigator.geolocation.getCurrentPosition(
                (position) => {
									const currentPosition = new window.kakao.maps.LatLng(
											position.coords.latitude,
											position.coords.longitude,
									);
                if(currentPosition){
									setLoading(false);
									map.panTo(currentPosition);
									toast.success("현재 접속 위치입니다.");
                }
							return currentPosition;
          	},
							() => {
									toast.error("현재 위치를 불러올 수 없음. 다시 시도해주세요.");
									setLoading(false);
							},
							options
            );
        }
    };

  return (
		<>
			{loading && <FullPageLoader />}
			<button 
				type="button" 
				onClick={handleCurrentPosition}
				className="fixed bottom-20 left-1/2 -translate-x-1/2 p-4 z-10 leading-5 shadow bg-black opacity-80 text-white font-bold rounded-full flex items-center justify-center transition-transform duration-300 md:hover:scale-125 ease-in-out will-change-transform"
			>
				<CiRoute className="w-4 h-4 md:w-6 md:h-6 subpixel-antialiased" />
			</button>
		</>
	)
}