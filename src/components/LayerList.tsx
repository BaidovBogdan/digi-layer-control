import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

import { LayerCard } from './LayerCard';
import type { LayerDefinition, LayerId } from '../features/layers/types';

interface LayerListProps {
  definitions: LayerDefinition[];
  onEnabledChange: (definition: LayerDefinition, enabled: boolean) => void;
  onOpacityChange: (layerId: LayerId, opacity: number) => void;
  onRetry: (definition: LayerDefinition) => void;
}

const VIRTUALIZATION_THRESHOLD = 20;

export function LayerList({
  definitions,
  onEnabledChange,
  onOpacityChange,
  onRetry,
}: LayerListProps) {
  const [query, setQuery] = useState('');
  const searchIsUseful = definitions.length > VIRTUALIZATION_THRESHOLD;
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const visibleDefinitions = useMemo(
    () =>
      normalizedQuery
        ? definitions.filter((definition) =>
            `${definition.name} ${definition.description} ${definition.id}`
              .toLocaleLowerCase('ru')
              .includes(normalizedQuery),
          )
        : definitions,
    [definitions, normalizedQuery],
  );

  return (
    <ListSection>
      {searchIsUseful ? (
        <SearchRow>
          <SearchInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти слой"
            aria-label="Найти слой по названию или описанию"
          />
          <ResultCount aria-live="polite">
            {visibleDefinitions.length} из {definitions.length}
          </ResultCount>
        </SearchRow>
      ) : null}

      {visibleDefinitions.length === 0 ? (
        <EmptyResult role="status">Слои по этому запросу не найдены</EmptyResult>
      ) : definitions.length > VIRTUALIZATION_THRESHOLD ? (
        <VirtualizedLayerItems
          definitions={visibleDefinitions}
          onEnabledChange={onEnabledChange}
          onOpacityChange={onOpacityChange}
          onRetry={onRetry}
        />
      ) : (
        <StaticLayers role="list" aria-label="Список картографических слоёв">
          {visibleDefinitions.map((definition) => (
            <ListItem role="listitem" key={definition.id}>
              <LayerCard
                definition={definition}
                onEnabledChange={onEnabledChange}
                onOpacityChange={onOpacityChange}
                onRetry={onRetry}
              />
            </ListItem>
          ))}
        </StaticLayers>
      )}
    </ListSection>
  );
}

function VirtualizedLayerItems({
  definitions,
  onEnabledChange,
  onOpacityChange,
  onRetry,
}: LayerListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [keyboardAccessEnabled, setKeyboardAccessEnabled] = useState(false);
  const virtualizer = useVirtualizer({
    count: definitions.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 178,
    getItemKey: (index) => definitions[index]?.id ?? index,
    overscan: keyboardAccessEnabled ? definitions.length : 5,
  });

  return (
    <VirtualizedLayers
      ref={scrollRef}
      aria-label="Список картографических слоёв"
      role="list"
      tabIndex={0}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) {
          setKeyboardAccessEnabled(true);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Tab') {
          setKeyboardAccessEnabled(true);
        }
      }}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
          setKeyboardAccessEnabled(false);
        }
      }}
    >
      <VirtualCanvas style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const definition = definitions[virtualItem.index];
          if (!definition) {
            return null;
          }

          return (
            <VirtualRow
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              role="listitem"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <LayerCard
                definition={definition}
                onEnabledChange={onEnabledChange}
                onOpacityChange={onOpacityChange}
                onRetry={onRetry}
              />
            </VirtualRow>
          );
        })}
      </VirtualCanvas>
    </VirtualizedLayers>
  );
}

const ListSection = styled.div`
  margin-top: 13px;
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
`;

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 11px;
  border: 1px solid #dfe6dd;
  border-radius: 9px;
  background: #fbfcfa;
  color: #2c4034;
  font-size: 12px;

  &:focus-visible {
    border-color: #6a9a78;
    outline: 3px solid #d4e7d8;
  }

  &::placeholder {
    color: #829087;
  }
`;

const ResultCount = styled.span`
  flex: 0 0 auto;
  color: #68766c;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
`;

const StaticLayers = styled.div`
  display: grid;
  gap: 10px;
`;

const ListItem = styled.div``;

const VirtualizedLayers = styled.div`
  height: min(560px, 62vh);
  min-height: 260px;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 13px;
  scrollbar-color: #c5d2c7 transparent;
  scrollbar-width: thin;

  &:focus-visible {
    outline: 3px solid #d4e7d8;
    outline-offset: 2px;
  }
`;

const VirtualCanvas = styled.div`
  position: relative;
  width: 100%;
`;

const VirtualRow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-bottom: 10px;
`;

const EmptyResult = styled.p`
  margin: 0;
  padding: 18px 10px;
  border: 1px dashed #d8e1d7;
  border-radius: 10px;
  color: #68766c;
  font-size: 12px;
  text-align: center;
`;
