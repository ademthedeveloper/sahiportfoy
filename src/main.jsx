import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import App from './App.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import './styles/global.css';

// Register GSAP plugins once at the entry point so every component can
// use ScrollTrigger without having to register it locally.
gsap.registerPlugin(ScrollTrigger);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
