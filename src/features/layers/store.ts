import { createVedro } from 'vedro';

import { INITIAL_STORE_STATE, type LayerId, type LayerState, type LayerStoreState } from './types';

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
): Partial<LayerStoreState> => ({
  layers: {
    ...state.layers,
    [layerId]: {
      ...state.layers[layerId],
      ...update,
    },
  },
});
