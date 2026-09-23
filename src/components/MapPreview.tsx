import styled from 'styled-components';

import { useLayerSelector } from '../features/layers/store';

const SPOT_POSITIONS = [
  { left: '27%', top: '34%' },
  { left: '60%', top: '56%' },
  { left: '76%', top: '27%' },
];

export function MapPreview() {
  const { activeLayers, totalActiveCount } = useLayerSelector((state) => {
    const active = state.catalog.definitions.flatMap((definition) => {
      const layer = state.layers[definition.id];
      return layer?.enabled ? [{ definition, state: layer }] : [];
    });

    return {
      activeLayers: active.slice(0, SPOT_POSITIONS.length),
      totalActiveCount: active.length,
    };
  });
  const hiddenLayerCount = totalActiveCount - activeLayers.length;

  return (
    <Preview aria-label="Предпросмотр карты">
      <PreviewHeader>
        <PreviewTitleGroup>
          <PreviewEyebrow>КАРТА</PreviewEyebrow>
          <PreviewTitle>Предпросмотр слоёв</PreviewTitle>
        </PreviewTitleGroup>
        <PreviewBadge>
          <BadgeDot />
          Условная визуализация
        </PreviewBadge>
      </PreviewHeader>

      <MapScene>
        <MapArtwork
          viewBox="0 0 900 620"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Схематичный фон без геоданных"
        >
          <defs>
            <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#cfdbd1" strokeWidth="1" />
            </pattern>
            <linearGradient id="map-wash" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eef2e8" />
              <stop offset="1" stopColor="#dfe9e3" />
            </linearGradient>
          </defs>
          <rect width="900" height="620" fill="url(#map-wash)" />
          <rect width="900" height="620" fill="url(#map-grid)" opacity="0.72" />
          <path
            d="M-35 430 C105 345 120 492 246 406 S390 322 490 399 639 466 749 363 852 318 940 371"
            fill="none"
            stroke="#a8c7c4"
            strokeWidth="34"
            opacity="0.56"
          />
          <path
            d="M-35 430 C105 345 120 492 246 406 S390 322 490 399 639 466 749 363 852 318 940 371"
            fill="none"
            stroke="#f6faf4"
            strokeWidth="17"
            opacity="0.82"
          />
          <g fill="none" stroke="#b4c4b7" strokeWidth="2" opacity="0.76">
            <path d="M-30 156 C94 87 156 193 257 137 S431 60 516 126 659 188 745 120 862 76 940 118" />
            <path d="M-30 181 C94 112 156 218 257 162 S431 85 516 151 659 213 745 145 862 101 940 143" />
            <path d="M-30 206 C94 137 156 243 257 187 S431 110 516 176 659 238 745 170 862 126 940 168" />
            <path d="M-30 498 C80 438 170 526 282 470 S434 417 533 470 690 547 798 466 880 430 950 458" />
            <path d="M-30 524 C80 464 170 552 282 496 S434 443 533 496 690 573 798 492 880 456 950 484" />
            <path d="M-30 550 C80 490 170 578 282 522 S434 469 533 522 690 599 798 518 880 482 950 510" />
          </g>
          <g fill="#cbd8cb" opacity="0.68">
            <path d="M113 262h82v48h-82zM217 250h62v58h-62zM296 279h84v43h-84zM403 242h65v54h-65z" />
            <path d="M575 227h88v47h-88zM688 248h74v52h-74zM493 490h76v42h-76zM592 508h82v38h-82z" />
            <path d="M170 365h61v37h-61zM265 346h75v42h-75zM708 399h75v40h-75z" />
          </g>
          <g fill="none" stroke="#f9fbf6" strokeWidth="7" opacity="0.92">
            <path d="M57 90 176 205l82 28 86-38 92 44 96-20 118 41 125-49" />
            <path d="m54 542 134-92 83 7 74-61 104 21 101-72 103 4 99-58" />
            <path d="m382 0 10 118-44 77 18 91-54 64 26 92-39 108" />
            <path d="m709 0-33 113 49 94-38 82 42 91-35 102 30 138" />
          </g>
          <g fill="#f9fbf6" stroke="#b7c8b9" strokeWidth="2">
            <circle cx="178" cy="205" r="7" />
            <circle cx="490" cy="239" r="7" />
            <circle cx="678" cy="207" r="7" />
            <circle cx="749" cy="380" r="7" />
          </g>
        </MapArtwork>

        {activeLayers.map(({ definition, state }, index) => (
          <LayerFootprint
            key={definition.id}
            $color={definition.color}
            $opacity={state.opacity / 100}
            style={SPOT_POSITIONS[index]}
          />
        ))}

        <MapNotice>Схематичный фон · геоданные не подключены</MapNotice>

        <MapLegend as="ul" aria-label="Включённые слои" role="list" aria-live="polite">
          {activeLayers.length ? (
            activeLayers.map(({ definition, state }) => (
              <LegendItem as="li" key={definition.id}>
                <LegendDot $color={definition.color} />
                <span>{definition.name}</span>
                {state.data ? (
                  <LegendValue>
                    {state.data.value} {state.data.unit}
                  </LegendValue>
                ) : null}
              </LegendItem>
            ))
          ) : (
            <EmptyLegend as="li">Включите слой, чтобы увидеть его в предпросмотре</EmptyLegend>
          )}
          {hiddenLayerCount > 0 ? <LegendMore as="li">+ ещё {hiddenLayerCount}</LegendMore> : null}
        </MapLegend>
      </MapScene>

      <PreviewCaption>
        Цветные области показывают активность mock-слоёв и не являются реальной картой.
      </PreviewCaption>
    </Preview>
  );
}

const Preview = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #e1e7df;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(37, 57, 46, 0.06);
`;

const PreviewHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px 18px;

  @media (max-width: 480px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
`;

const PreviewTitleGroup = styled.div`
  display: grid;
  gap: 4px;
`;

const PreviewEyebrow = styled.span`
  color: #66766b;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.13em;
`;

const PreviewTitle = styled.h2`
  margin: 0;
  color: #24372f;
  font-size: 16px;
  font-weight: 680;
  letter-spacing: -0.025em;
`;

const PreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid #e6ebe4;
  border-radius: 999px;
  color: #5f6e63;
  font-size: 10px;
  font-weight: 620;
  white-space: nowrap;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #98a89a;
`;

const MapScene = styled.div`
  position: relative;
  min-height: 480px;
  flex: 1;
  overflow: hidden;
  border: 1px solid #dce6dc;
  border-radius: 14px;
  background: #e8eee6;

  @media (max-width: 760px) {
    min-height: 360px;
  }

  @media (max-width: 480px) {
    min-height: 300px;
  }
`;

const MapArtwork = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const LayerFootprint = styled.span<{ $color: string; $opacity: number }>`
  position: absolute;
  width: clamp(145px, 25vw, 250px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${({ $color }) => `${$color}b8`} 0%,
    ${({ $color }) => `${$color}70`} 26%,
    ${({ $color }) => `${$color}00`} 72%
  );
  opacity: ${({ $opacity }) => $opacity * 0.72};
  mix-blend-mode: multiply;
  transform: translate(-50%, -50%);
  transition: opacity 220ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MapNotice = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.78);
  color: #68776d;
  font-size: 10px;
  font-weight: 620;
  backdrop-filter: blur(10px);
`;

const MapLegend = styled.div`
  position: absolute;
  right: 14px;
  bottom: 14px;
  left: 14px;
  display: flex;
  min-height: 42px;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(12px);
  list-style: none;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 7px;
  border-radius: 6px;
  color: #56655b;
  font-size: 11px;
  font-weight: 610;
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const LegendValue = styled.strong`
  margin-left: 2px;
  color: #35463a;
  font-variant-numeric: tabular-nums;
  font-weight: 720;
`;

const LegendMore = styled.li`
  padding: 4px 7px;
  color: #68766c;
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
`;

const EmptyLegend = styled.span`
  padding: 0 5px;
  color: #5f6e63;
  font-size: 11px;
`;

const PreviewCaption = styled.p`
  margin: 13px 2px 0;
  color: #647168;
  font-size: 11px;
  line-height: 1.45;
`;
