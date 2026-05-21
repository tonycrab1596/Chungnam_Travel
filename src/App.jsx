import { useEffect, useMemo, useState } from "react";
import CapsuleRandomPicker from "./components/CapsuleRandomPicker.jsx";
import SearchFilter from "./components/SearchFilter.jsx";
import VillageList from "./components/VillageList.jsx";
import VillageMap from "./components/VillageMap.jsx";
import { filterVillages, loadVillageData } from "./utils/parseVillageData.js";

const initialFilters = {
  villageName: "",
  district: "전체",
  programKeyword: "",
};

function App() {
  const [villages, setVillages] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    loadVillageData()
      .then((loadedVillages) => {
        if (!isMounted) {
          return;
        }

        setVillages(loadedVillages);
        setSelectedVillage(loadedVillages[0] ?? null);
        setStatus({ loading: false, error: "" });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatus({
          loading: false,
          error: `CSV 데이터를 불러오지 못했습니다. ${error?.message ?? ""}`,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const districts = useMemo(() => {
    const districtSet = new Set(villages.map((village) => village.district));
    return ["전체", ...Array.from(districtSet).sort((a, b) => a.localeCompare(b, "ko"))];
  }, [villages]);

  const filteredVillages = useMemo(
    () => filterVillages(villages, filters),
    [villages, filters],
  );

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setSelectedVillage(null);
  };

  const handleSelectVillage = (village) => {
    setSelectedVillage(village);
  };

  const handleRandomComplete = (village) => {
    setSelectedVillage(village);
    setRecommendationHistory((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== village.id);
      return [village, ...withoutDuplicate].slice(0, 5);
    });
  };

  return (
    <main className="app-shell">
      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">농촌체험휴양마을 지도 추천</p>
          <h1 id="page-title">충남 촌캉스 랜덤 여행</h1>
          <p className="hero-subtitle">오늘의 농촌 여행지를 캡슐 뽑기로 만나보세요</p>
        </div>

        <CapsuleRandomPicker
          villages={filteredVillages}
          selectedVillage={selectedVillage}
          history={recommendationHistory}
          onPickComplete={handleRandomComplete}
          onViewOnMap={handleSelectVillage}
        />
      </section>

      <section className="controls-band" aria-label="검색과 필터">
        <SearchFilter
          filters={filters}
          districts={districts}
          totalCount={villages.length}
          filteredCount={filteredVillages.length}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(initialFilters)}
        />
      </section>

      {status.loading && <div className="status-panel">CSV 데이터를 불러오는 중입니다.</div>}
      {status.error && <div className="status-panel error">{status.error}</div>}

      {!status.loading && !status.error && (
        <section className="workspace-grid" aria-label="여행지 지도와 목록">
          <VillageList
            villages={filteredVillages}
            selectedVillage={selectedVillage}
            onSelect={handleSelectVillage}
          />
          <VillageMap
            villages={filteredVillages}
            selectedVillage={selectedVillage}
            onSelect={handleSelectVillage}
          />
        </section>
      )}
    </main>
  );
}

export default App;
