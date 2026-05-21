// 지도 옆에서 현재 필터링된 여행지 목록을 보여주고, 클릭 시 지도 선택 상태를 바꿉니다.
function VillageList({ villages, selectedVillage, onSelect }) {
  return (
    <aside className="village-list-panel" aria-label="여행지 목록">
      <div className="list-header">
        <div>
          <p className="eyebrow">여행지 목록</p>
          <h2>{villages.length.toLocaleString("ko-KR")}곳</h2>
        </div>
        <span>충청남도</span>
      </div>

      {villages.length === 0 ? (
        <div className="empty-state">조건에 맞는 여행지가 없습니다</div>
      ) : (
        <div className="village-list">
          {villages.map((village) => {
            const isSelected = selectedVillage?.id === village.id;

            return (
              <button
                key={village.id}
                className={`village-list-item ${isSelected ? "is-selected" : ""}`}
                type="button"
                onClick={() => onSelect(village)}
              >
                <span className="district-pill">{village.district}</span>
                <strong>{village.name}</strong>
                <span>{village.programName}</span>
                <small>{village.address}</small>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export default VillageList;
