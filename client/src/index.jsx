import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Providers from './context/Providers';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);

window.onload = () => {
  rootElement.style.display = 'block';
};

if (
  import.meta.env.PROD &&
  typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object'
) {
  for (let [key, value] of Object.entries(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
  )) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
      typeof value == 'function' ? () => {} : null;
  }
}
