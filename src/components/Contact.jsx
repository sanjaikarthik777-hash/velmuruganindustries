import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './Contact.css';

const MAPS_LINK = 'https://maps.app.goo.gl/k52oKbc2Tb4xhksq9';
const MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.265!2d76.9868!3d11.0168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzAwLjQiTiA3NsKwNTknMTIuNiJF!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [contactData, setContactData] = useState({
    phone: '+91 9043426461',
    whatsapp: '919043426461',
    email: 'sandhyaa.9193@gmail.com',
    address: 'Ulavar Santhai, Gandhiji Rd,\nSundarapuram, Podanur,\nCoimbatore – 641023'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) {
        setContactData(prev => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text =
      `Hi, I got your contact from your website.\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Project Requirements:*\n${formData.message}`;
    const url = `https://wa.me/${contactData.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setFormData({ name: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        
        <div className="contact-grid">
          
          {/* Contact Information Card */}
          <div className="contact-info modern-card">
            <div className="info-items-list">
              <div className="info-row">
                <div className="info-icon-box"><Phone size={20} /></div>
                <div className="info-text-box">
                  <span className="info-label">PHONE</span>
                  <strong className="info-value">{contactData.phone}</strong>
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon-box"><Mail size={20} /></div>
                <div className="info-text-box">
                  <span className="info-label">EMAIL</span>
                  <strong className="info-value">{contactData.email}</strong>
                </div>
              </div>
              
              <div className="info-row border-none">
                <div className="info-icon-box"><MapPin size={20} /></div>
                <div className="info-text-box">
                  <span className="info-label">LOCATION</span>
                  <strong className="info-value">
                    {contactData.address.split('\n').map((line, i) => (
                      <React.Fragment key={i}>{line}<br/></React.Fragment>
                    ))}
                  </strong>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-btn"
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="social-action-buttons">
              <a href={`https://wa.me/${contactData.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-btn btn-wa">
                <FaWhatsapp size={20} /> Chat on WhatsApp
              </a>
              <a href="https://ig.me/m/sathishkumar1561" target="_blank" rel="noopener noreferrer" className="social-btn btn-ig">
                <FaInstagram size={20} /> DM on Instagram
              </a>
              <a href="https://www.facebook.com/share/1CxmJRjYv4/" target="_blank" rel="noopener noreferrer" className="social-btn btn-fb">
                <FaFacebook size={20} /> Message on Facebook
              </a>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="contact-form-container glass-panel">
            <h3>Request a Quote</h3>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text" id="name" name="name"
                  value={formData.name} onChange={handleChange}
                  required placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  required placeholder="Enter your mobile number"
                  pattern="[0-9]{10}" title="Please enter a valid 10-digit number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Project Requirements</label>
                <textarea
                  id="message" name="message"
                  value={formData.message} onChange={handleChange}
                  required placeholder="Tell us about what you need..." rows="5"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary submit-btn">
                <FaWhatsapp size={20} /> Send on WhatsApp
              </button>
            </form>
          </div>
          
        </div>

        {/* ── Google Maps Embed ── */}
        <div className="map-section">
          <div className="map-header">
            <MapPin size={18} />
            <span>Find Us on the Map</span>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="map-open-link">
              <Navigation size={13} /> Open in Google Maps
            </a>
          </div>
          <div className="map-wrapper">
            <iframe
              title="Velmurugan Grill Works Location"
              src={MAPS_EMBED}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-iframe"
            />
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="map-overlay-btn"
            >
              <Navigation size={16} />
              Get Directions
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
