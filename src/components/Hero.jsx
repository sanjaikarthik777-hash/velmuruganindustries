import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import useIsMobile from '../hooks/useIsMobile';
import './Hero.css';

const GrillStructure = ({ isMobile }) => {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 8) * 0.1;
    group.current.rotation.x = Math.sin(t / 10) * 0.05;
  });

  // Reduce complexity on mobile
  const beamCount = isMobile ? 4 : 6;
  const hBeamCount = isMobile ? 3 : 4;

  return (
    <group ref={group} position={[0, 0, -8]}>
      {[...Array(beamCount)].map((_, i) => (
        <mesh key={`beam-${i}`} position={[(i - (beamCount-1)/2) * 5, 0, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 40, 1]} />
          <meshStandardMaterial 
            color="#1E1E1E" 
            metalness={0.9} 
            roughness={0.4} 
            envMapIntensity={isMobile ? 0.5 : 1}
          />
        </mesh>
      ))}
      {[...Array(hBeamCount)].map((_, i) => (
        <mesh key={`h-beam-${i}`} position={[0, (i - (hBeamCount-1)/2) * 7, -2]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[40, 0.5, 1]} />
          <meshStandardMaterial 
            color="#2C2C2C" 
            metalness={0.8} 
            roughness={0.5} 
            envMapIntensity={isMobile ? 0.4 : 0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

const Sparks = ({ isMobile }) => {
  const ref = useRef();
  const count = isMobile ? 60 : 300; // Significantly reduced for mobile
  
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * (isMobile ? 1.5 : 2);
    }
    return [positions, sizes];
  }, [count, isMobile]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y -= delta * 0.05;
    ref.current.rotation.x -= delta * 0.02;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * (Math.random() * 0.5 + 0.1);
      if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        transparent
        color="#FF6B00"
        size={isMobile ? 0.1 : 0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const Hero = () => {
  const isMobile = useIsMobile();
  const [content, setContent] = useState({
    heroTitle: '10+ Years of Trusted',
    heroHighlight: 'Grill & Fabrication',
    heroSubtitle: 'Custom Gates, Railings, and Fabrication Solutions with Quality Craftsmanship'
  });
  const [contact, setContact] = useState({ phone: '9043426461' });

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, 'settings', 'homepage'), (doc) => {
      if (doc.exists()) setContent(prev => ({ ...prev, ...doc.data() }));
    });
    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) setContact(prev => ({ ...prev, ...doc.data() }));
    });
    return () => { unsubHome(); unsubContact(); };
  }, []);

  return (
    <section id="hero" className="hero-section">
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]} // Cap pixel ratio on mobile
          gl={{ 
            powerPreference: 'high-performance',
            antialias: !isMobile, // Disable antialiasing on mobile for better performance
            alpha: false
          }}
        >
          <fog attach="fog" args={['#0D0D0F', 5, 20]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          
          {/* Reduced light sources on mobile */}
          {!isMobile && <pointLight position={[-5, -5, 5]} intensity={2} color="#FF6B00" distance={10} />}
          <pointLight position={[5, 0, 2]} intensity={isMobile ? 1.5 : 1} color="#FF6B00" distance={8} />
          
          <GrillStructure isMobile={isMobile} />
          <Sparks isMobile={isMobile} />
          <Environment preset="night" />
        </Canvas>
      </div>

      <div className="hero-content container">
        <h1 className="hero-title">
          {content.heroTitle} <br/>
          <span className="text-gradient">{content.heroHighlight}</span> <br/>
        </h1>
        <p className="hero-subtitle">
          {content.heroSubtitle}
        </p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">Get a Quote</a>
          <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="btn btn-outline">Call Now</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
