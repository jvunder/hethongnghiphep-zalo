import React from 'react';
import { createRoot } from 'react-dom/client';
import { closeLoading } from 'zmp-sdk/apis';
import App from './app';

console.log('[DEBUG] main.tsx loaded, calling closeLoading...');

// QUAN TRỌNG: Gọi closeLoading NGAY LẬP TỨC trước khi React render
// Để đóng splash loading của Zalo càng sớm càng tốt
closeLoading()
  .then(() => {
    console.log('[DEBUG] closeLoading SUCCESS');
  })
  .catch((err) => {
    console.log('[DEBUG] closeLoading FAILED:', err);
  });

console.log('[DEBUG] Mounting React app...');

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log('[DEBUG] React app mounted');
} else {
  console.log('[DEBUG] Container #app not found!');
}
