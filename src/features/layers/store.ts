import { createVedro } from 'vedro';

import {
  INITIAL_LAYER_STATE,
  INITIAL_STORE_STATE,
  type LayerDefinition,
  type LayerId,
  type LayerState,
  type LayerStoreState,
} from './types';

export const {
  Provider: LayerStoreProvider,
  useSelector: useLayerSelector,
  useDispatch: useLayerDispatch,
  useStore: useLayerStore,
} = createVedro<LayerStoreState>(INITIAL_STORE_STATE);

export const updateLayerState = (
  state: LayerStoreState,
  layerId: LayerId,
  update: Partial<LayerState>,
): Partial<LayerStoreState> => {
  const layer = Object.hasOwn(state.layers, layerId) ? state.layers[layerId] : undefined;
  if (!layer) {
    return {};
  }

  return {
    layers: {
      ...state.layers,
      [layerId]: {
        ...layer,
        ...update,
      },
    },
  };
};

export const setLayerCatalog = (
  state: LayerStoreState,
  definitions: LayerDefinition[],
): Partial<LayerStoreState> => {
  const layers = Object.fromEntries(
    definitions.map(({ id }) => [
      id,
      Object.hasOwn(state.layers, id) ? state.layers[id] : { ...INITIAL_LAYER_STATE },
    ]),
  );

  return {
    catalog: {
      status: 'success',
      definitions,
      error: null,
    },
    layers,
  };
};
