export interface LayerDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  color: string;
}

export type LayerId = LayerDefinition['id'];

export type LayerStatus = 'idle' | 'loading' | 'success' | 'error';
export type CatalogStatus = 'loading' | 'success' | 'error';

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
  catalog: {
    status: CatalogStatus;
    definitions: LayerDefinition[];
    error: string | null;
  };
  layers: Record<LayerId, LayerState>;
}

export const INITIAL_LAYER_STATE: LayerState = {
  enabled: false,
  opacity: 80,
  status: 'idle',
  data: null,
  error: null,
  requestId: 0,
};

export const INITIAL_STORE_STATE: LayerStoreState = {
  catalog: {
    status: 'loading',
    definitions: [],
    error: null,
  },
  layers: {},
};

export const STATUS_LABELS: Record<LayerStatus, string> = {
  idle: 'Выключен',
  loading: 'Загрузка',
  success: 'Готов',
  error: 'Ошибка',
};
