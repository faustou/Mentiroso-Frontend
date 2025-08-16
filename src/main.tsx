// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // sin extensión o .tsx
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento #root en el index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
