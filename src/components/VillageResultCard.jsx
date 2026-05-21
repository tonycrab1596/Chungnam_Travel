import { useMemo } from "react";
import { makeExternalMapLinks, splitProgramItems } from "../utils/parseVillageData.js";

// 캡슐 뽑기 결과로 선택된 여행지의 핵심 정보를 보여주는 카드입니다.
function VillageResultCard({ village, onViewOnMap, onReroll, isAnimating }) {
  const programItems = useMemo(() => splitProgramItems(village?.programName), [village]);

  if (!village) {
    return null;
  }

  const links = makeExternalMapLinks(village);

  return (
    <article className="result-card">
      <p className="result-kicker">이번 촌캉스 여행지는?</p>
      <h3>{village.name}</h3>
      <span className="district-pill">{village.district}</span>

      <section className="program-selector" aria-label="체험 프로그램 목록">
        <div className="section-label">
          <strong>체험 프로그램</strong>
          <span>{programItems.length || 1}개</span>
        </div>
        <div className="program-chip-grid">
          {(programItems.length ? programItems : [village.programName]).map((program) => (
            <span
              key={program}
              className="program-chip"
              title={program}
            >
              {program}
            </span>
          ))}
        </div>
      </section>

      <dl className="result-meta">
        <dt>주소</dt>
        <dd>{village.address}</dd>
        <dt>전화</dt>
        <dd>{village.phone}</dd>
      </dl>

      <div className="result-links">
        {village.hasDirectHomepage && (
          <a href={village.homepage} target="_blank" rel="noreferrer">
            공식 홈페이지
          </a>
        )}
        <a href={links.homepageSearch} target="_blank" rel="noreferrer">
          홈페이지 검색
        </a>
        <a href={links.kakao} target="_blank" rel="noreferrer">
          카카오맵 검색
        </a>
        <a href={links.naver} target="_blank" rel="noreferrer">
          네이버 지도 검색
        </a>
      </div>

      <div className="result-actions">
        <button type="button" className="primary-button" onClick={() => onViewOnMap(village)}>
          지도에서 보기
        </button>
        <button type="button" className="secondary-button" onClick={onReroll} disabled={isAnimating}>
          다시 뽑기
        </button>
      </div>
    </article>
  );
}

export default VillageResultCard;
