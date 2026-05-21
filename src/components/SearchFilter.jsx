// 검색, 시군구 필터, 프로그램 키워드 필터를 한곳에서 관리하는 컴포넌트입니다.
function SearchFilter({ filters, districts, totalCount, filteredCount, onChange, onReset }) {
  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="search-filter">
      <div className="metric-strip" aria-label="여행지 개수">
        <div>
          <span>전체 여행지</span>
          <strong>{totalCount.toLocaleString("ko-KR")}</strong>
        </div>
        <div>
          <span>현재 보기</span>
          <strong>{filteredCount.toLocaleString("ko-KR")}</strong>
        </div>
      </div>

      <label className="field">
        <span>시군구</span>
        <select
          value={filters.district}
          onChange={(event) => updateFilter("district", event.target.value)}
        >
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>마을명 검색</span>
        <input
          type="search"
          value={filters.villageName}
          onChange={(event) => updateFilter("villageName", event.target.value)}
          placeholder="예: 사과, 별주부, 산꽃"
        />
      </label>

      <label className="field wide">
        <span>체험 키워드</span>
        <input
          type="search"
          value={filters.programKeyword}
          onChange={(event) => updateFilter("programKeyword", event.target.value)}
          placeholder="예: 딸기, 갯벌, 한지, 농작물"
        />
      </label>

      <button className="ghost-button" type="button" onClick={onReset}>
        필터 초기화
      </button>
    </div>
  );
}

export default SearchFilter;
