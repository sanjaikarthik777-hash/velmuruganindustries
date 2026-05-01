import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Settings,
  List,
  MessageSquare,
  LogOut,
  ExternalLink,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';
import * as THREE from 'three';
import ownerImg from '../OWNER.jpeg';

/* ─── Three.js animated background ─── */
const ThreeBg = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.z = 6;

    /* — Floating glowing particles — */
    const count = 220;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const gold = new THREE.Color('#c5a059');
    const blue = new THREE.Color('#1e3a5f');

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const c = Math.random() > 0.6 ? gold : blue;
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    /* — Wireframe torus knot — */
    const torusGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 120, 18);
    const torusMat = new THREE.MeshBasicMaterial({
      color: '#c5a059',
      wireframe: true,
      transparent: true,
      opacity: 0.07
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(8, 0, -2);
    scene.add(torus);

    /* — Icosahedron — */
    const icoGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: '#1e3a5f',
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(-9, 2, -3);
    scene.add(ico);

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.005;
      points.rotation.y = t * 0.12;
      points.rotation.x = t * 0.04;
      torus.rotation.x = t * 0.3;
      torus.rotation.y = t * 0.2;
      ico.rotation.x = t * 0.25;
      ico.rotation.z = t * 0.18;
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

/* ─── Sidebar owner card ─── */
const OwnerCard = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: '0 1rem 1.5rem',
        padding: '1rem',
        borderRadius: '14px',
        background: hovered
          ? 'linear-gradient(135deg,rgba(197,160,89,0.18),rgba(30,58,95,0.25))'
          : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(197,160,89,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        transition: 'all 0.4s ease',
        boxShadow: hovered ? '0 0 20px rgba(197,160,89,0.15)' : 'none',
        cursor: 'default'
      }}
    >
      <div style={{
        position: 'relative',
        flexShrink: 0
      }}>
        <img
          src={ownerImg}
          alt="Owner"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #c5a059',
            boxShadow: '0 0 12px rgba(197,160,89,0.5)',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)'
          }}
        />
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 1,
          width: 10,
          height: 10,
          background: '#22c55e',
          borderRadius: '50%',
          border: '2px solid #12121a'
        }} />
      </div>
      <div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Sathish Kumar</div>
        <div style={{ color: '#c5a059', fontSize: '0.72rem', fontWeight: 500 }}>
          Admin · Owner
        </div>
      </div>
    </div>
  );
};

/* ─── Animated nav item ─── */
const NavItem = ({ item }) => {
  const [hov, setHov] = useState(false);
  return (
    <NavLink
      to={item.path}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        color: isActive ? '#c5a059' : hov ? '#e2c98a' : '#94a3b8',
        textDecoration: 'none',
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        fontWeight: isActive ? 700 : 500,
        fontSize: '0.9rem',
        position: 'relative',
        overflow: 'hidden',
        background: isActive
          ? 'linear-gradient(90deg,rgba(197,160,89,0.18),rgba(197,160,89,0.05))'
          : hov
          ? 'rgba(255,255,255,0.05)'
          : 'transparent',
        borderLeft: isActive ? '3px solid #c5a059' : '3px solid transparent',
        boxShadow: isActive ? '0 0 15px rgba(197,160,89,0.12)' : 'none',
        transform: hov && !false ? 'translateX(3px)' : 'translateX(0)'
      })}
    >
      <span style={{ flexShrink: 0 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      <ChevronRight
        size={14}
        style={{
          opacity: hov ? 1 : 0,
          transform: hov ? 'translateX(0)' : 'translateX(-6px)',
          transition: 'all 0.3s ease'
        }}
      />
    </NavLink>
  );
};

/* ─── Main AdminLayout ─── */
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logHov, setLogHov] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  useEffect(() => {
    // Close mobile menu on navigation
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/admin/leads',     icon: <MessageSquare size={18} />,   label: 'Leads'     },
    { path: '/admin/gallery',   icon: <ImageIcon size={18} />,       label: 'Gallery'   },
    { path: '/admin/transform', icon: <Sparkles size={18} />,        label: 'Spotlight' },
    { path: '/admin/services',  icon: <List size={18} />,            label: 'Services'  },
    { path: '/admin/testimonials', icon: <MessageSquare size={18} />, label: 'Testimonials' },
    { path: '/admin/settings',  icon: <Settings size={18} />,        label: 'Settings'  },
  ];

  const pageLabel = navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Admin Panel';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 40%,#0f1d2e 0%,#0a0a0f 55%,#12050a 100%)',
      color: '#e2e8f0',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ThreeBg />

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="admin-mobile-show"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside 
        id="admin-sidebar"
        className={isMobileMenuOpen ? 'mobile-open' : ''}
        style={{
          width: 260,
          background: 'rgba(12,12,18,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(197,160,89,0.12)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 50,
          boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '1.6rem 1.5rem 1.2rem',
          borderBottom: '1px solid rgba(197,160,89,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg,#c5a059,#7c5f1e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(197,160,89,0.45)',
            flexShrink: 0
          }}>
            <Zap size={16} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#c5a059', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}>
              VGW Admin
            </div>
            <div style={{ color: '#475569', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Control Panel
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="admin-mobile-show"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>

        {/* Owner Card */}
        <div style={{ paddingTop: '1.2rem' }}>
          <OwnerCard />
        </div>

        {/* Section label */}
        <div style={{
          padding: '0 1.5rem 0.5rem',
          color: '#475569',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>
          Navigation
        </div>

        {/* Nav items */}
        <nav style={{
          padding: '0 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flex: 1
        }}>
          {navItems.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Footer stat */}
        <div style={{
          margin: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(197,160,89,0.06)',
          borderRadius: '10px',
          border: '1px solid rgba(197,160,89,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
            flexShrink: 0,
            animation: 'pulse-dot 2s ease-in-out infinite'
          }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>System Online</span>
        </div>

        {/* Logout */}
        <div style={{
          padding: '1rem 0.75rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogHov(true)}
            onMouseLeave={() => setLogHov(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              background: logHov ? 'rgba(239,68,68,0.12)' : 'transparent',
              border: `1px solid ${logHov ? 'rgba(239,68,68,0.35)' : 'transparent'}`,
              color: logHov ? '#ef4444' : '#64748b',
              cursor: 'pointer',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Topbar */}
        <header style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(197,160,89,0.1)',
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="admin-mobile-show"
              style={{
                background: 'rgba(197,160,89,0.1)',
                border: '1px solid rgba(197,160,89,0.2)',
                borderRadius: '8px',
                padding: '0.5rem',
                color: '#c5a059',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <List size={20} />
            </button>
            <div style={{
              width: 3,
              height: 24,
              background: 'linear-gradient(180deg,#c5a059,transparent)',
              borderRadius: 2
            }} className="admin-mobile-hide" />
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1rem, 4vw, 1.2rem)',
              fontWeight: 700,
              background: 'linear-gradient(90deg,#fff 60%,#c5a059)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {pageLabel}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-mobile-hide"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(197,160,89,0.4)',
                color: '#c5a059',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                background: 'rgba(197,160,89,0.06)'
              }}
            >
              <ExternalLink size={14} />
              Live Site
            </a>
            <img
              src={ownerImg}
              alt="Admin"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(197,160,89,0.6)',
                boxShadow: '0 0 10px rgba(197,160,89,0.3)'
              }}
            />
          </div>
        </header>

        {/* Content */}
        <div style={{
          padding: 'clamp(1rem, 5vw, 2rem)',
          flex: 1
        }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }

        @media (max-width: 1024px) {
          #admin-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          #admin-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
