import styled from 'styled-components';

import { useLayerSelector } from '../features/layers/store';

export function LayerSummary() {
  const summary = useLayerSelector((state) => {
    const layers = Object.values(state.layers);
    return {
      active: layers.filter((layer) => layer.enabled).length,
      loading: layers.filter((layer) => layer.status === 'loading').length,
      ready: layers.filter((layer) => layer.status === 'success').length,
    };
  });

  return (
    <Summary role="group" aria-label="Сводка по слоям">
      <SummaryItem>
        <SummaryValue>{summary.active}</SummaryValue>
        <SummaryLabel>включено</SummaryLabel>
      </SummaryItem>
      <SummaryItem>
        <SummaryValue $tone="loading">{summary.loading}</SummaryValue>
        <SummaryLabel>загружается</SummaryLabel>
      </SummaryItem>
      <SummaryItem>
        <SummaryValue $tone="ready">{summary.ready}</SummaryValue>
        <SummaryLabel>готово</SummaryLabel>
      </SummaryItem>
    </Summary>
  );
}

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 13px 0;
  border-top: 1px solid #edf0ea;
  border-bottom: 1px solid #edf0ea;
`;

const SummaryItem = styled.div`
  display: grid;
  gap: 2px;

  &:not(:first-child) {
    padding-left: 14px;
    border-left: 1px solid #edf0ea;
  }
`;

const SummaryValue = styled.strong<{ $tone?: 'loading' | 'ready' }>`
  color: ${({ $tone }) =>
    $tone === 'loading' ? '#b77917' : $tone === 'ready' ? '#32795d' : '#263b36'};
  font-size: 18px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const SummaryLabel = styled.span`
  color: #627168;
  font-size: 11px;
`;
