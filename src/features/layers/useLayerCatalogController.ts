import { useCallback, useEffect, useRef } from 'react';

import { loadLayerCatalog, validateLayerCatalog } from './api';
import { setLayerCatalog, useLayerStore } from './store';
import type { LayerStoreState } from './types';

interface CatalogRequest {
  sequence: number;
  controller: AbortController | null;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export const useLayerCatalogController = () => {
  const store = useLayerStore();
  const request = useRef<CatalogRequest>({ sequence: 0, controller: null });

  const load = useCallback((): void => {
    request.current.controller?.abort();
    request.current.sequence += 1;

    const sequence = request.current.sequence;
    const controller = new AbortController();
    request.current.controller = controller;

    store.dispatch((state: LayerStoreState) => ({
      catalog: {
        ...state.catalog,
        status: 'loading',
        error: null,
      },
    }));

    void loadLayerCatalog(controller.signal)
      .then((payload) => validateLayerCatalog(payload))
      .then((definitions) => {
        if (request.current.sequence !== sequence) {
          return;
        }

        request.current.controller = null;
        store.dispatch((state: LayerStoreState) => setLayerCatalog(state, definitions));
      })
      .catch((error: unknown) => {
        if (request.current.sequence !== sequence || isAbortError(error)) {
          return;
        }

        request.current.controller = null;
        store.dispatch((state: LayerStoreState) => ({
          catalog: {
            ...state.catalog,
            status: 'error',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка каталога',
          },
        }));
      });
  }, [store]);

  useEffect(
    () => () => {
      request.current.sequence += 1;
      request.current.controller?.abort();
      request.current.controller = null;
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { retry: load };
};
