import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { GlobalStyles } from './components/GlobalStyles';
import { LayerStoreProvider } from './features/layers/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LayerStoreProvider>
      <BrowserRouter>
        <GlobalStyles />
        <App />
      </BrowserRouter>
    </LayerStoreProvider>
  </StrictMode>,
);
