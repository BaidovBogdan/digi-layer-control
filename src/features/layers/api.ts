import type { LayerData, LayerDefinition } from './types';

const BASE_CATALOG: LayerDefinition[] = [
  {
    id: 'temperature',
    name: 'Температура',
    description: 'Температура поверхности',
    unit: '°C',
    color: '#e16f54',
  },
  {
    id: 'wind',
    name: 'Ветер',
    description: 'Скорость и направление',
    unit: 'м/с',
    color: '#438e9c',
  },
  {
    id: 'insolation',
    name: 'Инсоляция',
    description: 'Поток солнечной радиации',
    unit: 'Вт/м²',
    color: '#d1a53b',
  },
];

const MOCK_VALUES: Record<string, { value: number; delay: number }> = {
  temperature: { value: 18.6, delay: 900 },
  wind: { value: 4.8, delay: 1250 },
  insolation: { value: 642, delay: 700 },
};

const MOCK_COLORS = ['#6679a8', '#9674a7', '#5c9b83', '#bb8451', '#628f9e', '#9a9b56'];
const failedLayers = new Set<string>();
let catalogFailedOnce = false;

const wait = (duration: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const onAbort = (): void => {
      window.clearTimeout(timeoutId);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, duration);

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener('abort', onAbort, { once: true });
  });

const getCatalogCount = (): number => {
  const rawCount = new URLSearchParams(window.location.search).get('mockLayerCount');
  if (rawCount === null) {
    return BASE_CATALOG.length;
  }

  const parsedCount = Number(rawCount);
  return Number.isInteger(parsedCount)
    ? Math.min(1000, Math.max(0, parsedCount))
    : BASE_CATALOG.length;
};

const createDemoDefinition = (index: number): LayerDefinition => ({
  id: `demo-layer-${index}`,
  name: `Демо-слой ${index}`,
  description: 'Тестовый источник данных',
  unit: 'ед.',
  color: MOCK_COLORS[(index - BASE_CATALOG.length - 1) % MOCK_COLORS.length],
});

const createMockCatalog = (): LayerDefinition[] => {
  const count = getCatalogCount();
  const definitions = BASE_CATALOG.slice(0, count);

  for (let index = BASE_CATALOG.length + 1; index <= count; index += 1) {
    definitions.push(createDemoDefinition(index));
  }

  return definitions;
};

export const validateLayerCatalog = (payload: unknown): LayerDefinition[] => {
  if (!Array.isArray(payload)) {
    throw new Error('Каталог слоёв имеет неверный формат');
  }

  const ids = new Set<string>();
  const definitions = payload.map((item: unknown, index: number): LayerDefinition => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Слой ${index + 1} имеет неверный формат`);
    }

    const definition = item as Record<string, unknown>;
    const { id, name, description, unit, color } = definition;
    if (
      typeof id !== 'string' ||
      !id.trim() ||
      typeof name !== 'string' ||
      !name.trim() ||
      typeof description !== 'string' ||
      typeof unit !== 'string' ||
      typeof color !== 'string' ||
      !/^#[\da-f]{6}$/i.test(color)
    ) {
      throw new Error(`Слой ${index + 1} содержит некорректные данные`);
    }

    if (ids.has(id)) {
      throw new Error(`В каталоге повторяется идентификатор слоя «${id}»`);
    }

    ids.add(id);
    return { id, name, description, unit, color };
  });

  return definitions;
};

export const loadLayerCatalog = async (signal: AbortSignal): Promise<unknown> => {
  await wait(450, signal);

  const shouldFail = new URLSearchParams(window.location.search).get('mockCatalogError') === '1';
  if (shouldFail && !catalogFailedOnce) {
    catalogFailedOnce = true;
    throw new Error('Не удалось загрузить каталог слоёв');
  }

  return createMockCatalog();
};

const shouldForceLayerFailure = (layerId: string): boolean => {
  const forcedLayer = new URLSearchParams(window.location.search).get('mockError');
  const shouldFail = forcedLayer === '1' || forcedLayer === layerId;

  if (!shouldFail || failedLayers.has(layerId)) {
    return false;
  }

  failedLayers.add(layerId);
  return true;
};

const getLayerValue = (layerId: string): number => {
  const knownValue = MOCK_VALUES[layerId]?.value;
  if (knownValue !== undefined) {
    return knownValue;
  }

  let hash = 0;
  for (const character of layerId) {
    hash = (hash * 31 + character.charCodeAt(0)) % 1000;
  }
  return Number((hash / 10).toFixed(1));
};

export const loadLayerData = async (
  definition: LayerDefinition,
  signal: AbortSignal,
): Promise<LayerData> => {
  const mock = MOCK_VALUES[definition.id];
  const delay = mock?.delay ?? 500 + (definition.id.length % 5) * 100;
  await wait(delay, signal);

  if (shouldForceLayerFailure(definition.id)) {
    throw new Error('Mock API временно недоступен');
  }

  return {
    value: getLayerValue(definition.id),
    unit: definition.unit,
    source: 'mock API',
    updatedAt: new Date().toISOString(),
  };
};
