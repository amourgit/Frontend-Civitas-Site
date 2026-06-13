// ============================================================
// src/main.tsx — Point d'entrée standalone CIVITAS
// ============================================================
import React        from 'react';
import ReactDOM     from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CivitasApp   from './remote/App';
import './index.css';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CivitasApp embedded={false} basePath="/" />
    </BrowserRouter>
  </React.StrictMode>
);
