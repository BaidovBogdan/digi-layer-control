import { memo } from 'react';
import styled, { css } from 'styled-components';

import { useLayerSelector } from '../features/layers/store';
import type { LayerDefinition, LayerId, LayerStatus } from '../features/layers/types';
import { STATUS_LABELS } from '../features/layers/types';

interface LayerCardProps {
  definition: LayerDefinition;
  onEnabledChange: (definition: LayerDefinition, enabled: boolean) => void;
  onOpacityChange: (layerId: LayerId, opacity: number) => void;
  onRetry: (definition: LayerDefinition) => void;
}

export const LayerCard = memo(function LayerCard({
  definition,
  onEnabledChange,
  onOpacityChange,
  onRetry,
}: LayerCardProps) {
  const layer = useLayerSelector((state) => state.layers[definition.id]);
  const isLoading = layer.status === 'loading';

  return (
    <Card $enabled={layer.enabled} $accent={definition.color}>
      <CardHeader>
        <TitleGroup>
          <LayerGlyph $accent={definition.color} aria-hidden="true">
            <LayerIcon id={definition.id} />
          </LayerGlyph>
          <div>
            <LayerTitle>{definition.name}</LayerTitle>
            <LayerDescription>{definition.description}</LayerDescription>
          </div>
        </TitleGroup>
        <ToggleLabel>
          <ToggleInput
            type="checkbox"
            checked={layer.enabled}
            onChange={(event) => onEnabledChange(definition, event.target.checked)}
            aria-label={`${layer.enabled ? 'Выключить' : 'Включить'} слой ${definition.name}`}
          />
        </ToggleLabel>
      </CardHeader>

      <ControlBlock>
        <ControlRow>
          <ControlLabel htmlFor={`${definition.id}-opacity`}>Непрозрачность</ControlLabel>
          <OpacityValue htmlFor={`${definition.id}-opacity`}>{layer.opacity}%</OpacityValue>
        </ControlRow>
        <OpacityInput
          id={`${definition.id}-opacity`}
          type="range"
          min="0"
          max="100"
          step="1"
          value={layer.opacity}
          disabled={!layer.enabled}
          onChange={(event) => onOpacityChange(definition.id, Number(event.target.value))}
          aria-label={`Непрозрачность слоя ${definition.name}`}
        />
      </ControlBlock>

      <CardFooter>
        <Status $status={layer.status} role="status" aria-live="polite">
          <StatusDot $status={layer.status} />
          {isLoading ? 'Загружаем данные…' : STATUS_LABELS[layer.status]}
        </Status>
        {layer.status === 'success' && layer.data ? (
          <DataValue>
            {layer.data.value} {layer.data.unit}
          </DataValue>
        ) : null}
      </CardFooter>

      {layer.status === 'error' ? (
        <ErrorBox role="alert">
          <ErrorText>{layer.error ?? 'Не удалось загрузить слой'}</ErrorText>
          <RetryButton type="button" onClick={() => onRetry(definition)}>
            Повторить
          </RetryButton>
        </ErrorBox>
      ) : null}

      {layer.status === 'success' && layer.data ? (
        <UpdatedAt>
          {layer.data.source} · обновлено{' '}
          {new Date(layer.data.updatedAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </UpdatedAt>
      ) : null}
    </Card>
  );
});

function LayerIcon({ id }: { id: LayerId }) {
  if (id === 'temperature') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M10 14.3V5.8a2.3 2.3 0 1 1 4.6 0v8.5a4.2 4.2 0 1 1-4.6 0Z" />
        <path d="M12.3 11.4v6.1" />
      </svg>
    );
  }

  if (id === 'wind') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3.5 8.2h11a2.3 2.3 0 1 0-2.2-2.8M3.5 12h15a2.5 2.5 0 1 1-2.4 3.1M3.5 15.8h8.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.3" />
      <path d="M12 2.7v2.1M12 19.2v2.1M21.3 12h-2.1M4.8 12H2.7m15.9-6.6-1.5 1.5M6.9 17.1l-1.5 1.5m13.2 0-1.5-1.5M6.9 6.9 5.4 5.4" />
    </svg>
  );
}

const Card = styled.article<{ $enabled: boolean; $accent: string }>`
  padding: 16px 16px 13px;
  border: 1px solid ${({ $enabled, $accent }) => ($enabled ? `${$accent}70` : '#e7ebe5')};
  border-radius: 13px;
  background: ${({ $enabled, $accent }) => ($enabled ? `${$accent}0a` : '#fff')};
  transition:
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;

  ${({ $enabled, $accent }) =>
    $enabled &&
    css`
      box-shadow: inset 3px 0 0 ${$accent};
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
`;

const TitleGroup = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
`;

const LayerGlyph = styled.span<{ $accent: string }>`
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: ${({ $accent }) => `${$accent}17`};
  color: ${({ $accent }) => $accent};

  svg {
    width: 19px;
    height: 19px;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
  }
`;

const LayerTitle = styled.h3`
  margin: 0;
  color: #2c3d33;
  font-size: 13px;
  font-weight: 710;
  letter-spacing: -0.01em;
`;

const LayerDescription = styled.p`
  margin: 3px 0 0;
  color: #637168;
  font-size: 11px;
  line-height: 1.35;
`;

const ToggleLabel = styled.label`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
`;

const ToggleInput = styled.input`
  position: relative;
  width: 39px;
  height: 23px;
  margin: 0;
  appearance: none;
  border: 1px solid #d3dad2;
  border-radius: 99px;
  background: #e4e9e2;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease;

  &::after {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(29, 45, 34, 0.25);
    content: '';
    transition: transform 160ms ease;
  }

  &:checked {
    border-color: #397b60;
    background: #397b60;
  }

  &:checked::after {
    transform: translateX(16px);
  }

  &:focus-visible {
    outline: 3px solid #acd0b9;
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ControlBlock = styled.div`
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid #edf0ea;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const ControlLabel = styled.label`
  color: #5f6e63;
  font-size: 11px;
  font-weight: 590;
`;

const OpacityValue = styled.output`
  color: #35473a;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 720;
`;

const OpacityInput = styled.input`
  width: 100%;
  height: 28px;
  margin: 0;
  accent-color: #397b60;
  cursor: pointer;
  touch-action: pan-y;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.34;
  }

  &:focus-visible {
    outline: 2px solid #acd0b9;
    outline-offset: 4px;
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
`;

const Status = styled.span<{ $status: LayerStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: ${({ $status }) =>
    $status === 'error' ? '#a74f3d' : $status === 'success' ? '#397b60' : '#627168'};
  font-size: 10px;
  font-weight: 650;
`;

const StatusDot = styled.span<{ $status: LayerStatus }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $status }) =>
    ({ idle: '#b7c0b7', loading: '#d9a13c', success: '#4d9a72', error: '#d6755d' })[$status]};

  ${({ $status }) =>
    $status === 'loading' &&
    css`
      animation: pulse 1.1s ease-in-out infinite;
      @keyframes pulse {
        50% {
          opacity: 0.38;
        }
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DataValue = styled.strong`
  color: #33453a;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 730;
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding: 9px 10px;
  border: 1px solid #f1d6cc;
  border-radius: 9px;
  background: #fff8f5;
`;

const ErrorText = styled.span`
  color: #925443;
  font-size: 10px;
  line-height: 1.35;
`;

const RetryButton = styled.button`
  flex: 0 0 auto;
  padding: 4px 0 4px 5px;
  border: 0;
  background: transparent;
  color: #97533e;
  font-size: 10px;
  font-weight: 740;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:focus-visible {
    outline: 2px solid #d58c75;
    outline-offset: 3px;
  }
`;

const UpdatedAt = styled.p`
  margin: 8px 0 0 18px;
  color: #647168;
  font-size: 9px;
`;
