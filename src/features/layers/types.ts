export interface LayerDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  color: string;
  mockValue: number;
  mockDelayMs: number;
}

export type LayerId = LayerDefinition['id'];

export type LayerStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LayerData {
  value: number;
  unit: string;
  source: string;
  updatedAt: string;
}

export interface LayerState {
  enabled: boolean;
  opacity: number;
  status: LayerStatus;
  data: LayerData | null;
  error: string | null;
  requestId: number;
}

export interface LayerStoreState {
  layers: Record<LayerId, LayerState>;
}

export const LAYER_DEFINITIONS = [
  {
    id: 'temperature',
    name: 'Температура',
    description: 'Температура поверхности',
    unit: '°C',
    color: '#e16f54',
    mockValue: 18.6,
    mockDelayMs: 900,
  },
  {
    id: 'wind',
    name: 'Ветер',
    description: 'Скорость и направление',
    unit: 'м/с',
    color: '#438e9c',
    mockValue: 4.8,
    mockDelayMs: 1250,
  },
  {
    id: 'insolation',
    name: 'Инсоляция',
    description: 'Поток солнечной радиации',
    unit: 'Вт/м²',
    color: '#d1a53b',
    mockValue: 642,
    mockDelayMs: 700,
  },
] as const satisfies readonly LayerDefinition[];

export const INITIAL_LAYER_STATE: LayerState = {
  enabled: false,
  opacity: 80,
  status: 'idle',
  data: null,
  error: null,
  requestId: 0,
};

const createInitialLayers = (): Record<LayerId, LayerState> => {
  const layers: Record<LayerId, LayerState> = {};

  for (const definition of LAYER_DEFINITIONS) {
    layers[definition.id] = { ...INITIAL_LAYER_STATE };
  }

  return layers;
};

export const INITIAL_STORE_STATE: LayerStoreState = {
  layers: createInitialLayers(),
};

export const STATUS_LABELS: Record<LayerStatus, string> = {
  idle: 'Выключен',
  loading: 'Загрузка',
  success: 'Готов',
  error: 'Ошибка',
};
