import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Aggressive cache-busting on every page load
const clearAllCaches = async () => {
  if ('caches' in window) {
    try {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  }
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      registrations.forEach(reg => reg.unregister());
    } catch (e) {
      console.warn('Service worker unregister failed:', e);
    }
  }
};

clearAllCaches();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}