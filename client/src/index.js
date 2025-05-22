import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Create root using React 18 createRoot API
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app with BrowserRouter for routing
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
