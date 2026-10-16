import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';
document.title = 'NOA AI Studio';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
