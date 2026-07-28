import { useState } from 'react';
import BackgroundFX from './components/BackgroundFX.jsx';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Centerpiece3D from './components/Centerpiece3D.jsx';
import About from './components/About.jsx';
import Services from './components/Services.jsx';
import WhyChooseUs from './components/WhyChooseUs.jsx';
import Statistics from './components/Statistics.jsx';
import Portfolio from './components/Portfolio.jsx';
import Testimonials from './components/Testimonials.jsx';
import FAQ from './components/FAQ.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { useLenis } from './hooks/useLenis.js';

export default function App() {
  const [loaderDone, setLoaderDone] = useState(false);

  // Boot Lenis (no-op when reduced motion is preferred).
  useLenis();

  return (
    <>
      <BackgroundFX />
      <Loader onComplete={() => setLoaderDone(true)} />
      <Navbar />
      <main className={loaderDone ? 'is-ready' : ''}>
        <Hero />
        <Centerpiece3D />
        <About />
        <Services />
        <WhyChooseUs />
        <Statistics />
        <Portfolio />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
