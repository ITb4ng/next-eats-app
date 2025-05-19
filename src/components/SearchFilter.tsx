import { CiSearch } from "react-icons/ci";
import React, { useEffect, useState } from "react";
import { REGION_DATA } from "@/data/region";
import { useSearchStore } from "@/zustand";
import { useRouter } from "next/router";

export function RegionSelector() {
  const [selectedDo, setSelectedDo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const setDistrict = useSearchStore((state) => state.setDistrict);
  const router = useRouter();

  // 지역 선택 변경 시 query, Zustand 상태 반영 (300ms debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (selectedDo && selectedCity && selectedDo === "강원도" && selectedDong) {
        const district = `${selectedDo} ${selectedCity} ${selectedDong}`;
        setDistrict(district);
        router.replace({ query: { ...router.query, district } }, undefined, { shallow: true });
      } else if (selectedDo && selectedCity) {
        const district = `${selectedDo} ${selectedCity}`;
        setDistrict(district);
        router.replace({ query: { ...router.query, district } }, undefined, { shallow: true });
      } else {
        setDistrict(null);
        const { district, ...rest } = router.query;
        router.replace({ query: rest }, undefined, { shallow: true });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [selectedDo, selectedCity, selectedDong]);

  // query에 따른 초기값 세팅 (페이지 방문 시 등)
  useEffect(() => {
    const { district } = router.query;
    if (typeof district === "string") {
      const parts = district.split(" ");
      setSelectedDo(parts[0] || "");
      setSelectedCity(parts[1] || "");
      setSelectedDong(parts[2] || "");
    }
  }, [router.query]);

  // 초기화 버튼 클릭
  const handleReset = () => {
    router.push({ pathname: router.pathname, query: {} });
    useSearchStore.setState({ q: null, district: null });
    setSelectedDo("");
    setSelectedCity("");
    setSelectedDong("");
  };

  // 시/도 선택에 따른 시/군/구 옵션 반환
  const getSecondLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (Array.isArray(selected)) return selected;
    if (typeof selected === "object" && selected !== null)
      return Object.keys(selected);
    return [];
  };

  // 시/군/구 선택에 따른 읍/면/동 옵션 반환 (강원도만)
  const getThirdLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (typeof selected === "object" && selected !== null && !Array.isArray(selected)) {
      return selected[selectedCity as keyof typeof selected] ?? [];
    }
    return [];
  };

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {/* 시/도 선택 */}
      <select
        onChange={(e) => {
          setSelectedDo(e.target.value);
          setSelectedCity("");
          setSelectedDong("");
        }}
        value={selectedDo}
        className="flex-1 min-w-[150px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      >
        <option value="">시/도 선택</option>
        {Object.keys(REGION_DATA).map((sido) => (
          <option key={sido} value={sido}>
            {sido}
          </option>
        ))}
      </select>

      {/* 시/군/구 선택 */}
      {selectedDo && (
        <select
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedDong("");
          }}
          value={selectedCity}
          className="flex-1 min-w-[150px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">시/군/구 선택</option>
          {getSecondLevelOptions().map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      )}

      {/* 읍/면/동 선택 (강원도만) */}
      {selectedDo === "강원도" && selectedCity && (
        <select
          onChange={(e) => setSelectedDong(e.target.value)}
          value={selectedDong}
          className="flex-1 min-w-[150px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">읍/면/동 선택</option>
          {getThirdLevelOptions().map((dong) => (
            <option key={dong} value={dong}>
              {dong}
            </option>
          ))}
        </select>
      )}

      {/* 초기화 버튼 */}
      <button
        onClick={handleReset}
        className="flex-1 min-w-[150px] px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
      >
        초기화
      </button>
    </div>
  );
}

export default function SearchFilter() {
  const setQ = useSearchStore((state) => state.setQ);
  const q = useSearchStore((state) => state.q);
  const router = useRouter();

  useEffect(() => {
    if (router.query.q && typeof router.query.q === "string") {
      setQ(router.query.q);
    }
  }, [router.query.q]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQ = e.target.value || null;
    setQ(newQ);
    router.push({ query: { ...router.query, q: newQ || undefined } });
  };

  return (
    <div className="relative flex flex-col gap-3 my-4 w-full">
      <div className="flex items-center w-full">
        <CiSearch className="w-6 h-6 text-gray-500 mr-2" />
        <input
          type="search"
          onChange={handleSearchChange}
          value={q ?? ""}
          placeholder="맛집 검색"
          className="block w-full p-2.5 text-base text-gray-800 border border-gray-300 rounded-xl bg-gray-100 focus:border-indigo-500 focus:outline-none transition"
        />
      </div>
      <RegionSelector />
    </div>
  );
}
