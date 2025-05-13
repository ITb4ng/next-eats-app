import { StoreType } from "@/interface";
import { useEffect, useCallback } from "react";
import { useMapStore } from "@/zustand";

interface MarkersProps {
    store: StoreType;
}

export default function Marker({ store }: MarkersProps) {
    const map = useMapStore((state) => state.map);

    const loadKakaoMarker = useCallback(() => {
        if (map && store && store.lat && store.lng) {
            // Check for category and set marker image
            const imageSrc = store.category
                ? `/images/markers/${store.category}.png`
                : "/images/markers/default.png";
            const imageSize = new window.kakao.maps.Size(40, 40); // Default marker size
            const imageOption = { offset: new window.kakao.maps.Point(24, 59) }; // Offset

            // Create the marker image
            const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            // Marker position based on store's lat/lng
            const markerPosition = new window.kakao.maps.LatLng(store.lat, store.lng);

            // Create the marker
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                image: markerImage,
            });

            // Set the marker on the map
            marker.setMap(map);

            const content = `<div class="infowindow">${store.name}</div>`;

            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: content,
                xAnchor: 0.6,
                yAnchor: 0.91,
            });

            // Register mouseover event
            window.kakao.maps.event.addListener(marker, "mouseover", function () {
                customOverlay.setMap(map);
            });

            // Register mouseout event
            window.kakao.maps.event.addListener(marker, "mouseout", function () {
                customOverlay.setMap(null);
            });
        }
    }, [map, store]);

    useEffect(() => {
        if (map && store?.lat && store?.lng) {
            loadKakaoMarker();
        }
    }, [loadKakaoMarker, map, store?.lat, store?.lng]);

    return <></>;
}
