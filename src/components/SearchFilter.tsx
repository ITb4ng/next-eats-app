import { CiSearch } from "react-icons/ci";
import React, { useEffect, useState } from "react";
import { getCanonicalRegionName, REGION_DATA } from "@/data/region";
import { useSearchStore } from "@/zustand";
import { useRouter } from "next/router";

const selectClass =
  "min-h-11 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[--color-signature] focus:outline-none focus:ring-2 focus:ring-[rgba(42,193,188,0.18)]";

export function RegionSelector() {
  const [selectedDo, setSelectedDo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const setDistrict = useSearchStore((state) => state.setDistrict);
  const setAcceptsPaySupport = useSearchStore((state) => state.setAcceptsPaySupport);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (selectedDo && selectedCity && selectedDong) {
        const district = `${selectedDo} ${selectedCity} ${selectedDong}`;
        setDistrict(district);
        router.replace({ query: { ...router.query, district } }, undefined, { shallow: true });
      } else if (selectedDo && selectedCity) {
        const district = `${selectedDo} ${selectedCity}`;
        setDistrict(district);
        router.replace({ query: { ...router.query, district } }, undefined, { shallow: true });
      } else if (selectedDo) {
        setDistrict(selectedDo);
        router.replace({ query: { ...router.query, district: selectedDo } }, undefined, {
          shallow: true,
        });
      } else {
        setDistrict(null);
        const { district, ...rest } = router.query;
        router.replace({ query: rest }, undefined, { shallow: true });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [router, selectedCity, selectedDo, selectedDong, setDistrict]);

  useEffect(() => {
    const { district } = router.query;
    if (typeof district === "string") {
      const parts = district.split(" ");
      setSelectedDo(parts[0] ? getCanonicalRegionName(parts[0]) : "");
      setSelectedCity(parts[1] || "");
      setSelectedDong(parts[2] || "");
    }
  }, [router.query]);

  const handleReset = () => {
    router.push({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    useSearchStore.setState({ q: null, district: null, acceptsPaySupport: false });
    setAcceptsPaySupport(false);
    setSelectedDo("");
    setSelectedCity("");
    setSelectedDong("");
  };

  const getSecondLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (Array.isArray(selected)) return selected;
    if (typeof selected === "object" && selected !== null) return Object.keys(selected);
    return [];
  };

  const getThirdLevelOptions = () => {
    const selected = REGION_DATA[selectedDo as keyof typeof REGION_DATA];
    if (typeof selected === "object" && selected !== null && !Array.isArray(selected)) {
      return selected[selectedCity as keyof typeof selected] ?? [];
    }
    return [];
  };

  const secondLevelOptions = getSecondLevelOptions();
  const thirdLevelOptions = getThirdLevelOptions();

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <select
        aria-label="시도 선택"
        onChange={(e) => {
          setSelectedDo(e.target.value);
          setSelectedCity("");
          setSelectedDong("");
        }}
        value={selectedDo}
        className={selectClass}
      >
        <option value="">시/도 전체</option>
        {Object.keys(REGION_DATA).map((sido) => (
          <option key={sido} value={sido}>
            {sido}
          </option>
        ))}
      </select>

      {selectedDo && secondLevelOptions.length > 0 && (
        <select
          aria-label="시군구 선택"
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedDong("");
          }}
          value={selectedCity}
          className={selectClass}
        >
          <option value="">시/군/구 전체</option>
          {secondLevelOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      )}

      {selectedCity && thirdLevelOptions.length > 0 && (
        <select
          aria-label="읍면동 선택"
          onChange={(e) => setSelectedDong(e.target.value)}
          value={selectedDong}
          className={selectClass}
        >
          <option value="">읍/면/동 전체</option>
          {thirdLevelOptions.map((dong) => (
            <option key={dong} value={dong}>
              {dong}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="min-h-11 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
      >
        필터 초기화
      </button>
    </div>
  );
}

export default function SearchFilter() {
  const setQ = useSearchStore((state) => state.setQ);
  const setAcceptsPaySupport = useSearchStore((state) => state.setAcceptsPaySupport);
  const q = useSearchStore((state) => state.q);
  const acceptsPaySupport = useSearchStore((state) => state.acceptsPaySupport);
  const router = useRouter();

  useEffect(() => {
    if (router.query.q && typeof router.query.q === "string") {
      setQ(router.query.q);
    }
  }, [router.query.q, setQ]);

  useEffect(() => {
    setAcceptsPaySupport(router.query.acceptsPaySupport === "true");
  }, [router.query.acceptsPaySupport, setAcceptsPaySupport]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQ = e.target.value || null;
    setQ(newQ);
    router.push({ query: { ...router.query, q: newQ || undefined } }, undefined, { shallow: true });
  };

  const handlePaySupportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const nextQuery = { ...router.query };

    if (checked) {
      nextQuery.acceptsPaySupport = "true";
    } else {
      delete nextQuery.acceptsPaySupport;
    }

    setAcceptsPaySupport(checked);
    router.push({ query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <section className="mb-5 w-full rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <label htmlFor="store-search" className="block text-sm font-semibold text-gray-900">
          맛집 검색
        </label>
        <div className="mt-2 flex min-h-11 items-center rounded-md border border-gray-300 bg-gray-50 px-3 transition focus-within:border-[--color-signature] focus-within:ring-2 focus-within:ring-[rgba(42,193,188,0.18)]">
          <CiSearch className="mr-2 h-5 w-5 shrink-0 text-gray-500" />
          <input
            id="store-search"
            type="search"
            onChange={handleSearchChange}
            value={q ?? ""}
            placeholder="가게명으로 검색"
            className="block w-full bg-transparent py-2 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>
      <RegionSelector />
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
        <input
          type="checkbox"
          checked={acceptsPaySupport}
          onChange={handlePaySupportChange}
          className="h-4 w-4 rounded border-gray-300 text-[--color-signature] focus:ring-[--color-signature]"
        />
        <span>지원금 사용 가능 매장만 보기</span>
      </label>
    </section>
  );
}
