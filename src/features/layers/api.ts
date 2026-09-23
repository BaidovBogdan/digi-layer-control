import type { LayerData, LayerDefinition } from './types';

const failedOnce = new Set<string>();

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

const shouldForceFailure = (layerId: string): boolean => {
  const forcedLayer = new URLSearchParams(window.location.search).get('mockError');
  const shouldFail = forcedLayer === '1' || forcedLayer === layerId;

  if (!shouldFail || failedOnce.has(layerId)) {
    return false;
  }

  failedOnce.add(layerId);
  return true;
};

export const loadLayerData = async (
  definition: LayerDefinition,
  signal: AbortSignal,
): Promise<LayerData> => {
  await wait(definition.mockDelayMs, signal);

  if (shouldForceFailure(definition.id)) {
    throw new Error('Mock API временно недоступен');
  }

  return {
    value: definition.mockValue,
    unit: definition.unit,
    source: 'mock API',
    updatedAt: new Date().toISOString(),
  };
};
