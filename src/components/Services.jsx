import React, { useRef, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import './Services.css';

const DynamicIcon = ({ name, size = 24 }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Shield;
  return <IconComponent size={size} />;
};

const TiltCard = ({ service }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className="tilt-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: rotation.x === 0 && rotation.y === 0 ? 'transform 0.5s ease' : 'none'
      }}
    >
      <div className="tilt-card glass-panel">
        <div className="card-icon" style={{color: '#c5a059', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(197, 160, 89, 0.1)', borderRadius: '12px', marginBottom: '1.5rem'}}>
          <DynamicIcon name={service.icon || 'Settings'} size={24} />
        </div>
        <h3 className="card-title">{service.title}</h3>
        <p className="card-desc">{service.description}</p>

      </div>
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    return () => unsub();
  }, []);

  return (
    <section id="services" className="section services-section">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {services.map(service => (
            <TiltCard key={service.id} service={service} />
          ))}
          {services.length === 0 && <p style={{color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1'}}>Loading services...</p>}
        </div>
      </div>
    </section>
  );
};

export default Services;
