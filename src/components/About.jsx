import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import ownerImage from '../OWNER.jpeg';
import useIsMobile from '../hooks/useIsMobile';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const Badge3D = () => {
  const outerRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.2;
      outerRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* Outer Wireframe */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[2.2, 1]} />
          <meshStandardMaterial 
            color="#C5A059" 
            wireframe 
            transparent 
            opacity={0.4} 
            emissive="#C5A059" 
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Text hovering in front to prevent clipping without expanding past canvas */}
        <group position={[0, 0, 1.4]}>
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.55}
            color="#C5A059"
            anchorX="center"
            anchorY="center"
            fontWeight="bold"
            letterSpacing={0.05}
          >
            10 YEARS
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.3}
            color="#F4F4F5"
            anchorX="center"
            anchorY="center"
            letterSpacing={0.2}
            fontWeight="bold"
          >
            EXPERIENCE
          </Text>
        </group>
      </group>
    </Float>
  );
};

const About = () => {
  const isMobile = useIsMobile();
  const textRef = useRef(null);
  const ownerRef = useRef(null);
  const [aboutText, setAboutText] = useState(
    "Based in Coimbatore, Tamil Nadu, Velmurugan Grill Works has been a trusted name in the grill and fabrication industry for over a decade. We specialize in custom gates, railings, window grills, and complex metal fabrication solutions.\n\nOur industrial expertise combined with high-quality materials ensures durability and aesthetics. From residential to commercial projects, we bring your vision to life with unparalleled precision and care."
  );

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (doc) => {
      if (doc.exists() && doc.data().aboutText) {
        setAboutText(doc.data().aboutText);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Only animate on desktop for performance
    if (isMobile) {
      gsap.set([textRef.current, ownerRef.current], { opacity: 1, y: 0, x: 0 });
      return;
    }

    gsap.fromTo(
      textRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 80%',
        },
      }
    );

    gsap.fromTo(
      ownerRef.current,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: ownerRef.current,
          start: 'top 80%',
        },
      }
    );
  }, [isMobile]);

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        <div className="about-content">
          
          <div className="about-badge-container">
            <Canvas 
              camera={{ position: [0, 0, 6], fov: 45 }}
              dpr={isMobile ? [1, 1.5] : [1, 2]}
              gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Badge3D />
            </Canvas>
          </div>

          <div className="about-text" ref={textRef}>
            <h3 className="about-subtitle">Master Craftsmanship in Every Weld</h3>
            {aboutText.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index}>{paragraph}</p> : null
            ))}
            
            <div className="owner-profile glass-panel" ref={ownerRef}>
              <div className="owner-image-placeholder">
                <img src={ownerImage} alt="Sathish Kumar" loading="lazy" />
              </div>
              <div className="owner-info">
                <h4>Sathish Kumar</h4>
                <span className="owner-role">Founder & Lead Fabricator</span>
                <p>"Quality isn't just an act, it's our habit. We build structures that last a lifetime."</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default About;
