import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Suppress third-party Chrome extension script errors (e.g. couponCollection.js) from raising dev overlays
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.filename?.includes('chrome-extension://') ||
      event.message?.includes('chrome-extension://') ||
      event.message?.includes('couponCollection')
    ) {
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '');
    if (
      reason.includes('chrome-extension://') ||
      reason.includes('couponCollection') ||
      reason.includes('Could not establish connection')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
