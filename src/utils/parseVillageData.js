import Papa from "papaparse";

const CSV_PATH = `${import.meta.env.BASE_URL}data/chungnam_village_data_chungnam_only(1).csv`;

const emptyText = "정보 없음";

const cleanText = (value) => {
  const text = String(value ?? "").trim();
  return text || emptyText;
};

const cleanOptionalText = (value) => String(value ?? "").trim();

const normalizeHomepage = (value) => {
  const url = cleanOptionalText(value);

  if (!url || url === emptyText) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).toString();
    } catch {
      return "";
    }
  }

  try {
    return new URL(`https://${url}`).toString();
  } catch {
    return "";
  }
};

const isReliableHomepage = (url) => {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const isAsciiHostname = /^[\x00-\x7F]+$/.test(parsed.hostname);

    // CSV에 오래된 http 한글 도메인이 여럿 있어 직접 이동 시 오류 체감이 큽니다.
    // 검증 가능한 https/ascii 도메인만 직접 방문 버튼으로 노출하고, 나머지는 검색 링크를 제공합니다.
    return parsed.protocol === "https:" && isAsciiHostname;
  } catch {
    return false;
  }
};

const toNumber = (value) => {
  const number = Number(String(value ?? "").trim());
  return Number.isFinite(number) ? number : null;
};

export const makeExternalMapLinks = (village) => {
  const query = encodeURIComponent(`${village.name} ${village.address}`);
  const homepageQuery = encodeURIComponent(`${village.name} 홈페이지 ${village.address}`);

  return {
    kakao: `https://map.kakao.com/link/search/${query}`,
    naver: `https://map.naver.com/p/search/${query}`,
    homepageSearch: `https://search.naver.com/search.naver?query=${homepageQuery}`,
  };
};

export const splitProgramItems = (programText) =>
  String(programText ?? "")
    .split("+")
    .map((item) => item.trim())
    .filter((item) => item && item !== emptyText);

const normalizeVillage = (row, index) => {
  const latitude = toNumber(row["위도"]);
  const longitude = toNumber(row["경도"]);

  if (latitude === null || longitude === null) {
    return null;
  }

  const name = cleanText(row["체험마을명"]);
  const district = cleanText(row["시군구명"]);
  const address = cleanText(row["소재지도로명주소"]);
  const programType = cleanText(row["체험프로그램구분"]);
  const programName = cleanText(row["체험프로그램명"]);

  const homepageRaw = cleanOptionalText(row["홈페이지주소"]);
  const homepage = normalizeHomepage(homepageRaw);

  return {
    id: cleanOptionalText(row["시스템키"]) || `${name}-${index}`,
    name,
    province: cleanText(row["시도명"]),
    district,
    programType,
    programName,
    facilities: cleanText(row["보유시설정보"]),
    imageUrl: cleanOptionalText(row["체험휴양마을사진"]),
    address,
    phone: cleanText(row["대표전화번호"]),
    homepageRaw,
    homepage,
    hasDirectHomepage: isReliableHomepage(homepage),
    latitude,
    longitude,
    referenceDate: cleanText(row["데이터기준일자"]),
  };
};

export const loadVillageData = (csvPath = CSV_PATH) =>
  new Promise((resolve, reject) => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors?.length) {
          reject(result.errors[0]);
          return;
        }

        const villages = result.data
          .map((row, index) => normalizeVillage(row, index))
          .filter(Boolean);

        resolve(villages);
      },
      error: reject,
    });
  });

export const filterVillages = (villages, filters) => {
  const villageQuery = filters.villageName.trim().toLowerCase();
  const keywordQuery = filters.programKeyword.trim().toLowerCase();
  const selectedDistrict = filters.district;

  return villages.filter((village) => {
    const matchesName =
      !villageQuery || village.name.toLowerCase().includes(villageQuery);
    const matchesDistrict =
      selectedDistrict === "전체" || village.district === selectedDistrict;
    const matchesProgram =
      !keywordQuery ||
      village.programName.toLowerCase().includes(keywordQuery) ||
      village.programType.toLowerCase().includes(keywordQuery);

    return matchesName && matchesDistrict && matchesProgram;
  });
};
