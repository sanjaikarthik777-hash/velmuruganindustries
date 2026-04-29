import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './Testimonials.css';

const StarRating = ({ rating = 5 }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < rating ? "#c5a059" : "none"} color="#c5a059" />
    ))}
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data);
    });
    return () => unsub();
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <section id="testimonials" className="section testimonials-section">

      <div className="container">
        <div className="section-header-centered">
          <span className="section-subtitle">Real feedback from real clients</span>
          <h2 className="section-title">Client <span className="text-gradient">Testimonials</span></h2>
        </div>
        
        {testimonials.length > 0 ? (
          <div className="premium-slider">
            <div className="slider-wrapper">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.4 }
                  }}
                  className="testimonial-card glass-panel"
                >
                  <div className="quote-badge">
                    <Quote size={24} fill="#c5a059" color="#c5a059" />
                  </div>
                  
                  <StarRating rating={testimonials[currentIndex]?.rating || 5} />
                  
                  <p className="testimonial-quote">
                    "{testimonials[currentIndex]?.text}"
                  </p>
                  
                  <div className="author-info">
                    <div className="author-avatar">
                      {testimonials[currentIndex]?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="author-name">{testimonials[currentIndex]?.name}</h4>
                      <span className="author-role">{testimonials[currentIndex]?.role}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {testimonials.length > 1 && (
              <div className="slider-controls">
                <button className="control-btn" onClick={prevSlide}>
                  <ChevronLeft size={24} />
                </button>
                
                <div className="dots-container">
                  {testimonials.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`nav-dot ${idx === currentIndex ? 'active' : ''}`}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                    />
                  ))}
                </div>

                <button className="control-btn" onClick={nextSlide}>
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="loading-state">
            <div className="loader-ring"></div>
            <p>Loading testimonials...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
