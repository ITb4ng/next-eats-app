import { CiSearch } from "react-icons/ci";
import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { REGION_DATA } from "@/data/region";
import { useSearchStore } from "@/zustand";

interface SearchFilterProps {
  setQ: Dispatch<SetStateAction<string | null>>;
  setDistrict: Dispatch<SetStateAction<string | null>>;
}

interface RegionSelectorProps {
  setDistrict: Dispatch<SetStateAction<string | null>>;
}

export function RegionSelector() {
  const [selectedDo, setSelectedDo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const setDistrict = useSearchStore((state) => state.setDistrict);
  useEffect(() => {
    if (selectedDo && selectedCity && selectedDo === "강원도" && selectedDong) {
      setDistrict(`${selectedDo} ${selectedCity} ${selectedDong}`);
    } else if (selectedDo && selectedCity) {
      setDistrict(`${selectedDo} ${selectedCity}`);
    } else {
      setDistrict(null);
    }
  }, [selectedDo, selectedCity, selectedDong,setDistrict]);

  const resetSelections = () => {
    setSelectedDo("");
    setSelectedCity("");
    setSelectedDong("");
    setDistrict(null);
  };

  const getSecondLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (Array.isArray(selected)) return selected;
    if (typeof selected === "object" && selected !== null)
      return Object.keys(selected);
    return [];
  };

  const getThirdLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (
      typeof selected === "object" &&
      selected !== null &&
      !Array.isArray(selected)
    ) {
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
        onClick={resetSelections}
        className="flex-1 min-w-[150px] px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
      >
        초기화
      </button>
    </div>
  );
}

export default function SearchFilter() {
  const setQ = useSearchStore((state) => state.setQ);
  return (
    <div className="flex flex-col gap-3 my-4 w-full">
      <div className="flex items-center w-full">
        <CiSearch className="w-6 h-6 text-gray-500 mr-2" />
        <input
          type="search"
          onChange={(e) => setQ(e.target.value || null)}
          placeholder="맛집 검색"
          className="block w-full p-2.5 text-base text-gray-800 border border-gray-300 rounded-xl bg-gray-100 focus:border-indigo-500 focus:outline-none transition"
        />
      </div>
      <RegionSelector />
    </div>
  );
}
