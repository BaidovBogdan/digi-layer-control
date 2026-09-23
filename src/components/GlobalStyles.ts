import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    font-family: Geist, "Segoe UI Variable", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    color: #263d32;
    background: #f4f6f2;
    color-scheme: light;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  body {
    min-width: 0;
    min-height: 100vh;
    margin: 0;
  }

  button,
  input {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  ::selection {
    background: #d0e4d5;
    color: #243b30;
  }
`;
