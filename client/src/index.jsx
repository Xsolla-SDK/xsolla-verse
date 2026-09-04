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

