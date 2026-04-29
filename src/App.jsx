import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaCalculator } from 'react-icons/fa';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Materials from './components/Materials';
import Applications from './components/Applications';
import TrustElements from './components/TrustElements';
import Footer from './components/Footer';
import SEO from './components/SEO';
import Intro from './components/Intro';
import AdminRoutes from './routes/AdminRoutes';
import QuoteGenerator from './components/QuoteGenerator';
import CostCalculator from './components/CostCalculator';

// Lazy Loaded Components
const Gallery = React.lazy(() => import('./components/Gallery'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const Contact = React.lazy(() => import('./components/Contact'));

const MainSite = () => {
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('vgw_intro_seen') === 'true') {
      setIntroFinished(true);
    }
    
    const trackVisit = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const statsRef = doc(db, 'analytics', 'daily_visits');
        const statsSnap = await getDoc(statsRef);
        
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          await setDoc(statsRef, {
            ...data,
            [today]: (data[today] || 0) + 1,
            total: (data.total || 0) + 1
          });
        } else {
          await setDoc(statsRef, { [today]: 1, total: 1 });
        }
      } catch (err) { console.error(err); }
    };
    trackVisit();
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('vgw_intro_seen', 'true');
    setIntroFinished(true);
  };

  return (
    <>
      {!introFinished && <Intro onComplete={handleIntroComplete} />}
      <div className={`app-container ${introFinished ? 'intro-ready' : 'intro-loading'}`}>
        <SEO />
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <Materials />
          <Applications />
          <TrustElements />
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Gallery />
            <Testimonials />
          </Suspense>
          <CostCalculator />
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Contact />
          </Suspense>
        </main>
        <Footer />
      </div>

      {/* Overlays and Floating elements - Fixed to prevent layout shifts */}
      <div className="overlay-layer" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 9999,
        opacity: introFinished ? 1 : 0, 
        transition: 'opacity 0.5s ease' 
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <QuoteGenerator />
        </div>
        <div className="action-hub" style={{ pointerEvents: 'auto' }}>
          <motion.div 
            className="hub-pill-premium ai-quote-hub"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.dispatchEvent(new CustomEvent('openQuoteGenerator'))}
          >
            <div className="hub-icon-premium">
              <FaCalculator size={18} />
            </div>
            <span className="hub-label-premium">Get AI Quote</span>
          </motion.div>

          <a href="https://wa.me/919043426461" target="_blank" rel="noopener noreferrer" className="hub-symbol wa-symbol" title="WhatsApp Us">
            <FaWhatsapp size={26} />
          </a>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<MainSite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
