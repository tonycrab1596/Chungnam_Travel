import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet.markercluster";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { makeExternalMapLinks, splitProgramItems } from "../utils/parseVillageData.js";

const CHUNGNAM_CENTER = [36.5184, 126.8];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultIcon = L.divIcon({
  className: "village-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const selectedIcon = L.divIcon({
  className: "selected-village-marker",
  html: "<span></span>",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

function MapFocusController({ selectedVillage, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedVillage) {
      return;
    }

    map.flyTo([selectedVillage.latitude, selectedVillage.longitude], 13, {
      animate: true,
      duration: 0.8,
    });

    [550, 950, 1400].forEach((delay) => {
      window.setTimeout(() => {
        map.invalidateSize();
        markerRefs.current[selectedVillage.id]?.openPopup();
      }, delay);
    });
  }, [map, markerRefs, selectedVillage]);

  return null;
}

function VillagePopup({ village, onSelect }) {
  const links = makeExternalMapLinks(village);
  const programItems = splitProgramItems(village.programName).slice(0, 8);

  return (
    <div className="map-popup">
      <header>
        <strong>{village.name}</strong>
        <p>{village.district}</p>
      </header>
      <div className="popup-program-chips">
        {programItems.map((program) => (
          <span key={program}>{program}</span>
        ))}
      </div>
      <dl>
        <dt>주소</dt>
        <dd>{village.address}</dd>
        <dt>전화</dt>
        <dd>{village.phone}</dd>
      </dl>
      <div className="popup-actions">
        <button type="button" onClick={() => onSelect(village)}>
          선택
        </button>
        {village.hasDirectHomepage && (
          <a href={village.homepage} target="_blank" rel="noreferrer">
            공식 홈페이지
          </a>
        )}
        <a href={links.homepageSearch} target="_blank" rel="noreferrer">
          홈페이지 검색
        </a>
        <a href={links.naver} target="_blank" rel="noreferrer">
          지도 검색
        </a>
      </div>
    </div>
  );
}

// Leaflet 지도를 렌더링하고, 마커 클릭/리스트 클릭/랜덤 결과 선택을 같은 선택 상태로 연결합니다.
function VillageMap({ villages, selectedVillage, onSelect }) {
  const markerRefs = useRef({});
  const selectedVillageInView = selectedVillage
    ? villages.find((village) => village.id === selectedVillage.id)
    : null;
  const clusteredVillages = selectedVillageInView
    ? villages.filter((village) => village.id !== selectedVillageInView.id)
    : villages;

  const bounds = useMemo(() => {
    if (!villages.length) {
      return null;
    }

    return villages.map((village) => [village.latitude, village.longitude]);
  }, [villages]);

  return (
    <section className="map-panel" aria-label="충남 농촌 여행지 지도">
      <MapContainer
        center={CHUNGNAM_CENTER}
        zoom={9}
        scrollWheelZoom
        className="village-map"
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [28, 28], maxZoom: 11 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={46}>
          {clusteredVillages.map((village) => {
            return (
              <Marker
                key={village.id}
                position={[village.latitude, village.longitude]}
                icon={defaultIcon}
                eventHandlers={{ click: () => onSelect(village) }}
                ref={(marker) => {
                  if (marker) {
                    markerRefs.current[village.id] = marker;
                  }
                }}
              >
                <Popup minWidth={310} maxWidth={380} className="village-leaflet-popup">
                  <VillagePopup village={village} onSelect={onSelect} />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {selectedVillageInView && (
          <Marker
            key={`selected-${selectedVillageInView.id}`}
            position={[selectedVillageInView.latitude, selectedVillageInView.longitude]}
            icon={selectedIcon}
            eventHandlers={{ click: () => onSelect(selectedVillageInView) }}
            ref={(marker) => {
              if (marker) {
                markerRefs.current[selectedVillageInView.id] = marker;
              }
            }}
          >
            <Popup minWidth={310} maxWidth={380} className="village-leaflet-popup">
              <VillagePopup village={selectedVillageInView} onSelect={onSelect} />
            </Popup>
          </Marker>
        )}

        <MapFocusController selectedVillage={selectedVillage} markerRefs={markerRefs} />
      </MapContainer>
    </section>
  );
}

export default VillageMap;
