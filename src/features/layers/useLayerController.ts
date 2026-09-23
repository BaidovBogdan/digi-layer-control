import { useCallback, useEffect, useRef } from 'react';

import { loadLayerData } from './api';
import { updateLayerState, useLayerDispatch, useLayerSelector, useLayerStore } from './store';
import type { LayerDefinition, LayerId, LayerStoreState } from './types';

interface RequestState {
  sequence: number;
  controller: AbortController | null;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const getRequestState = (requests: Map<LayerId, RequestState>, layerId: LayerId): RequestState => {
  const current = requests.get(layerId);
  if (current) {
    return current;
  }

  const request: RequestState = { sequence: 0, controller: null };
  requests.set(layerId, request);
  return request;
};

export const useLayerController = () => {
  const dispatch = useLayerDispatch();
  const store = useLayerStore();
  const definitions = useLayerSelector((state) => state.catalog.definitions);
  const requests = useRef(new Map<LayerId, RequestState>());

  useEffect(
    () => () => {
      for (const request of requests.current.values()) {
        request.sequence += 1;
        request.controller?.abort();
      }
      requests.current.clear();
    },
    [],
  );

  useEffect(() => {
    const catalogIds = new Set(definitions.map(({ id }) => id));

    for (const [layerId, request] of requests.current) {
      if (catalogIds.has(layerId)) {
        continue;
      }

      request.sequence += 1;
      request.controller?.abort();
      requests.current.delete(layerId);
    }
  }, [definitions]);

  const startLoading = useCallback(
    (definition: LayerDefinition): void => {
      const request = getRequestState(requests.current, definition.id);
      request.controller?.abort();
      request.sequence += 1;

      const requestId = request.sequence;
      const controller = new AbortController();
      request.controller = controller;

      dispatch((state: LayerStoreState) =>
        updateLayerState(state, definition.id, {
          enabled: true,
          status: 'loading',
          data: null,
          error: null,
          requestId,
        }),
      );

      void loadLayerData(definition, controller.signal)
        .then((data) => {
          const current = store.get().layers[definition.id];
          const latestRequest = requests.current.get(definition.id);
          if (!latestRequest || latestRequest.sequence !== requestId) {
            return;
          }

          latestRequest.controller = null;
          if (!current?.enabled) {
            return;
          }

          dispatch((state: LayerStoreState) =>
            updateLayerState(state, definition.id, {
              status: 'success',
              data,
              error: null,
            }),
          );
        })
        .catch((error: unknown) => {
          const latestRequest = requests.current.get(definition.id);
          if (!latestRequest || latestRequest.sequence !== requestId) {
            return;
          }

          latestRequest.controller = null;
          if (isAbortError(error)) {
            return;
          }

          const current = store.get().layers[definition.id];
          if (!current?.enabled) {
            return;
          }

          dispatch((state: LayerStoreState) =>
            updateLayerState(state, definition.id, {
              status: 'error',
              error: error instanceof Error ? error.message : 'Неизвестная ошибка запроса',
            }),
          );
        });
    },
    [dispatch, store],
  );

  const setEnabled = useCallback(
    (definition: LayerDefinition, enabled: boolean): void => {
      if (enabled) {
        startLoading(definition);
        return;
      }

      const request = getRequestState(requests.current, definition.id);
      request.sequence += 1;
      request.controller?.abort();
      request.controller = null;

      dispatch((state: LayerStoreState) =>
        updateLayerState(state, definition.id, {
          enabled: false,
          status: 'idle',
          error: null,
          requestId: request.sequence,
        }),
      );
    },
    [dispatch, startLoading],
  );

  const setOpacity = useCallback(
    (layerId: LayerId, opacity: number): void => {
      const safeOpacity = Number.isFinite(opacity)
        ? Math.round(Math.min(100, Math.max(0, opacity)))
        : 80;
      dispatch((state: LayerStoreState) =>
        updateLayerState(state, layerId, { opacity: safeOpacity }),
      );
    },
    [dispatch],
  );

  return { setEnabled, setOpacity, retry: startLoading };
};
