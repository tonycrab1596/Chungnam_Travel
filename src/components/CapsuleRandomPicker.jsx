import { useEffect, useMemo, useRef, useState } from "react";
import VillageResultCard from "./VillageResultCard.jsx";

const capsuleColors = ["green", "orange", "cream", "brown", "red", "mint", "yellow"];

function pickRandomItem(items) {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function playTone(context, startAt, duration, frequency, type = "sine", gainValue = 0.08) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playRollingNoise(context, startAt, duration, gainValue = 0.035) {
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
  const output = buffer.getChannelData(0);

  for (let index = 0; index < output.length; index += 1) {
    const fadeIn = Math.min(1, index / (sampleRate * 0.08));
    const fadeOut = Math.min(1, (output.length - index) / (sampleRate * 0.18));
    const wobble = Math.sin(index * 0.018) * 0.45 + Math.sin(index * 0.041) * 0.28;
    output[index] = (Math.random() * 2 - 1) * (0.36 + wobble) * fadeIn * fadeOut;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(520, startAt);
  filter.frequency.linearRampToValueAtTime(250, startAt + duration);
  filter.Q.setValueAtTime(1.4, startAt);
  gain.gain.setValueAtTime(gainValue, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(startAt);
  source.stop(startAt + duration);
}

function playDrawSounds() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const now = context.currentTime;

  // 둥근 캡슐 공들이 통 안에서 구르는 느낌을 노이즈로 만듭니다.
  playRollingNoise(context, now + 0.04, 1.55, 0.05);
  playRollingNoise(context, now + 1.18, 0.9, 0.032);

  // 손잡이가 딸깍딸깍 돌아가는 느낌
  Array.from({ length: 14 }).forEach((_, index) => {
    playTone(context, now + 0.55 + index * 0.07, 0.035, 170 + (index % 4) * 38, "square", 0.035);
  });

  // 내부 기어가 감기는 낮은 소리
  playTone(context, now + 0.72, 0.75, 95, "sawtooth", 0.028);

  // 캡슐이 굴러 떨어지는 소리
  playTone(context, now + 2.0, 0.22, 240, "triangle", 0.06);
  playTone(context, now + 2.16, 0.18, 145, "triangle", 0.05);

  // 캡슐이 열리는 짧은 팝 사운드
  playTone(context, now + 2.56, 0.1, 720, "sine", 0.08);
  playTone(context, now + 2.62, 0.16, 980, "sine", 0.05);

  window.setTimeout(() => {
    context.close().catch(() => {});
  }, 3600);
}

// 랜덤 추천의 핵심 재미 요소입니다. CSS 도형만으로 캡슐 뽑기 기계와 3단계 애니메이션을 표현합니다.
function CapsuleRandomPicker({ villages, selectedVillage, history, onPickComplete, onViewOnMap }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState(null);
  const resultZoneRef = useRef(null);

  const canPick = villages.length > 0 && !isAnimating;

  const capsuleNodes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        color: capsuleColors[index % capsuleColors.length],
        style: {
          "--x": `${12 + ((index * 19) % 68)}%`,
          "--y": `${16 + ((index * 23) % 54)}%`,
          "--delay": `${(index % 5) * 0.08}s`,
          "--turn": `${index % 2 === 0 ? "-" : ""}${12 + index * 3}deg`,
        },
      })),
    [],
  );

  const startDraw = () => {
    if (!canPick) {
      return;
    }

    const picked = pickRandomItem(villages);
    playDrawSounds();
    setIsOpen(true);
    setIsAnimating(true);
    setResult(null);

    window.setTimeout(() => {
      setResult(picked);
      setIsAnimating(false);
      onPickComplete(picked);
    }, 2800);
  };

  useEffect(() => {
    if (!result || window.innerWidth > 980) {
      return;
    }

    window.setTimeout(() => {
      resultZoneRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  }, [result]);

  const closeModal = () => {
    if (isAnimating) {
      return;
    }

    setIsOpen(false);
  };

  const viewOnMap = (village) => {
    onViewOnMap(village);
    setIsOpen(false);

    window.setTimeout(() => {
      document.querySelector(".map-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  };

  return (
    <div className="random-picker-panel">
      <button
        type="button"
        className="draw-button"
        onClick={startDraw}
        disabled={!canPick}
        aria-busy={isAnimating}
      >
        랜덤 촌캉스 뽑기
      </button>
      <p>{villages.length ? `${villages.length}곳 중에서 뽑습니다` : "조건에 맞는 여행지가 없습니다"}</p>

      {selectedVillage && (
        <div className="current-pick">
          <span>현재 선택</span>
          <strong>{selectedVillage.name}</strong>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-box">
          <span>최근 추천 5개</span>
          <ol>
            {history.map((village) => (
              <li key={village.id}>
                <button type="button" onClick={() => onViewOnMap(village)}>
                  {village.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {isOpen && (
        <div className="picker-overlay" role="dialog" aria-modal="true" aria-label="랜덤 촌캉스 뽑기">
          <div className={`picker-modal ${result ? "result-stage" : "machine-stage"}`}>
            <button className="modal-close" type="button" onClick={closeModal} disabled={isAnimating}>
              닫기
            </button>

            {!result && (
              <div className={`capsule-machine ${isAnimating ? "is-running" : ""}`}>
                <div className="machine-top">
                  <div className="glass-dome">
                    {capsuleNodes.map((capsule) => (
                      <span
                        key={capsule.id}
                        className={`capsule capsule-${capsule.color}`}
                        style={capsule.style}
                      />
                    ))}
                  </div>
                  <div className="machine-shine" />
                </div>

                <div className="machine-body">
                  <div className="coin-slot" />
                  <div className="handle">
                    <span />
                  </div>
                  <div className="machine-label">CHONCANCE</div>
                </div>

                <div className="machine-base">
                  <div className="capsule-door" />
                  <div className="falling-capsule">
                    <span />
                  </div>
                </div>

                <div className="drawing-copy">
                  <strong>캡슐을 섞는 중입니다</strong>
                  <span>캡슐이 굴러가고 손잡이가 돌아갑니다.</span>
                </div>
              </div>
            )}

            {result && (
              <div className="picker-result-zone" ref={resultZoneRef}>
                <VillageResultCard
                  village={result}
                  onViewOnMap={viewOnMap}
                  onReroll={startDraw}
                  isAnimating={isAnimating}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CapsuleRandomPicker;
