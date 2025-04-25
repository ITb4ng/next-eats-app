import { CiSearch } from "react-icons/ci";
import React, { Dispatch, SetStateAction, useState } from "react";
import { REGION_DATA } from "@/data/region";

interface SearchFilterProps {
  setQ: Dispatch<SetStateAction<string | null>>;
  setDistrict: Dispatch<SetStateAction<string | null>>;
}

interface RegionSelectorProps {
  setDistrict: Dispatch<SetStateAction<string | null>>;
  setQ: Dispatch<SetStateAction<string | null>>;
}

export function RegionSelector({ setDistrict, setQ }: RegionSelectorProps) {
  const [selectedDo, setSelectedDo] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDong, setSelectedDong] = useState<string>("");

  const resetSelections = () => {
    setSelectedDo("");
    setSelectedCity("");
    setSelectedDong("");
    setDistrict(null);
    setQ(null);
  };

  const handleDoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDo(value);
    setSelectedCity("");
    setSelectedDong("");
    setDistrict(null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCity(value);
    setSelectedDong("");

    const selectedRegion = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    setDistrict(`${selectedDo} ${value}`);
  };

  const handleDongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDong(value);
    setDistrict(`${selectedDo} ${selectedCity} ${value}`);
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
      {/* 시/도 */}
      <select
        onChange={handleDoChange}
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

      {/* 시/군/구 */}
      {selectedDo && (
        <select
          onChange={handleCityChange}
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

      {/* 읍/면/동 */}
      {selectedDo === "강원도" && selectedCity && (
        <select
          onChange={handleDongChange}
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

export default function SearchFilter({ setQ, setDistrict }: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 my-4 w-full">
      <div className="flex items-center w-full">
        <CiSearch className="w-6 h-6 text-gray-500 mr-2" />
        <input
          type="search"
          onChange={(e) => setQ(e.target.value)}
          placeholder="맛집 검색"
          className="block w-full p-2.5 text-base text-gray-800 border border-gray-300 rounded-xl bg-gray-100 focus:border-indigo-500 focus:outline-none transition"
        />
      </div>
      <RegionSelector setQ={setQ} setDistrict={setDistrict} />
    </div>
  );
}
