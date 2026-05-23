export type RegionData = Record<string, string[] | Record<string, string[]>>;

export const REGION_DATA: RegionData = {
  서울특별시: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
    "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
  ],
  부산광역시: ["연제구"],
  대구광역시: ["중구"],
  인천광역시: ["남동구"],
  광주광역시: ["서구"],
  대전광역시: ["서구"],
  울산광역시: ["남구"],
  세종특별자치시: [],
  경기도: ["수원시"],
  강원특별자치도: {
    "춘천시": [
      "교동", "근화동", "낙원동", "봉의동", "석사동", "소양동", "송암동",
      "신사우동", "약사명동", "온의동", "우두동", "조양동", "퇴계동", "후평동",
      "남산면", "동면", "동산면", "서면", "사북면", "신동면", "남면", "북산면"
    ]
  },
  충청북도: ["청주시"],
  충청남도: ["홍성군"],
  전북특별자치도: ["전주시"],
  전라남도: ["무안군"],
  경상북도: ["안동시"],
  경상남도: ["창원시"],
  제주특별자치도: ["제주시"],
};

const REGION_NAME_ALIASES: Record<string, string[]> = {
  강원특별자치도: ["강원도"],
  강원도: ["강원특별자치도"],
  전북특별자치도: ["전라북도"],
  전라북도: ["전북특별자치도"],
};

const REGION_CANONICAL_NAMES: Record<string, string> = {
  강원도: "강원특별자치도",
  전라북도: "전북특별자치도",
};

export const getCanonicalRegionName = (regionName: string) =>
  REGION_CANONICAL_NAMES[regionName] ?? regionName;

export const getDistrictSearchCandidates = (district?: string | null) => {
  if (!district) {
    return [];
  }

  const normalizedDistrict = district.trim();
  if (!normalizedDistrict) {
    return [];
  }

  const [regionName, ...rest] = normalizedDistrict.split(" ");
  const suffix = rest.length > 0 ? ` ${rest.join(" ")}` : "";
  const aliases = REGION_NAME_ALIASES[regionName] ?? [];

  return Array.from(
    new Set([
      normalizedDistrict,
      ...aliases.map((alias) => `${alias}${suffix}`),
    ])
  );
};
