import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

const SettingsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [homepage, setHomepage] = useState({
    heroTitle: 'CRAFTING EXCELLENCE IN',
    heroHighlight: 'METAL & DESIGN',
    heroSubtitle: 'Velmurugan Grill Works — Transforming spaces with premium fabrication, robust structures, and aesthetic grill designs for over 10 years.'
  });

  const [contact, setContact] = useState({
    phone: '+91 90434 26461',
    whatsapp: '919043426461',
    email: 'velmurugangrillworks@gmail.com',
    address: '123 Industrial Estate, Main Road, City - 600001'
  });

  const [pricing, setPricing] = useState({
    MS: 250,
    SS: 450,
    Aluminium: 350,
    WoodMetal: 550,
    Labor: 5000,
    Installation: 2000
  });

  const [seo, setSeo] = useState({
    title: 'Velmurugan Grill Works | Premium Gate Fabrication',
    description: 'Leading gate fabrication and industrial metalworks in South India.',
    keywords: 'gates, grills, fabrication, metalworks, industrial sheds'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const homeSnap = await getDoc(doc(db, 'settings', 'homepage'));
        if (homeSnap.exists()) setHomepage(homeSnap.data());
        
        const contactSnap = await getDoc(doc(db, 'settings', 'contact'));
        if (contactSnap.exists()) setContact(contactSnap.data());

        const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
        if (pricingSnap.exists()) setPricing(pricingSnap.data());

        const seoSnap = await getDoc(doc(db, 'settings', 'seo'));
        if (seoSnap.exists()) setSeo(seoSnap.data());
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'homepage'), homepage);
      await setDoc(doc(db, 'settings', 'contact'), contact);
      await setDoc(doc(db, 'settings', 'pricing'), pricing);
      await setDoc(doc(db, 'settings', 'seo'), seo);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const seedData = async () => {
    if(!window.confirm("This will add the default services and testimonials. Continue?")) return;
    try {
      const services = [
        { title: 'Gate Fabrication', description: 'Custom designed automated and manual gates for residential and commercial properties. Built for security and aesthetic appeal.', icon: 'Shield', order: 1 },
        { title: 'Window Grills', description: 'Elegant and secure window grills crafted from high-grade steel and iron. Various modern and traditional patterns available.', icon: 'Grid', order: 2 },
        { title: 'Stair Railings', description: 'Durable stair railings that provide safety without compromising on design. Available in stainless steel and wrought iron.', icon: 'List', order: 3 },
        { title: 'Custom Metal Works', description: 'Bespoke metal fabrication for industrial needs, roofing structures, and custom decorative items based on your requirements.', icon: 'Settings', order: 4 }
      ];
      for (const service of services) await addDoc(collection(db, 'services'), service);
      const testimonials = [
        { name: 'Ramesh K.', role: 'Homeowner', text: 'Velmurugan Grill Works completely transformed our main gate. The metallic finish and design are top-notch.' },
        { name: 'Priya S.', role: 'Architect', text: 'I have collaborated with Sathish and his team on multiple commercial projects. Their attention to detail is unmatched.' }
      ];
      for (const t of testimonials) await addDoc(collection(db, 'testimonials'), t);
      setMessage('Default data loaded successfully!');
    } catch(err) {
      console.error("Error seeding data:", err);
      setMessage("Error loading demo data.");
    }
  };

  if (loading) return <div style={styles.loading}>Loading settings...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Website Settings</h2>
      {message && <div style={{...styles.alert, background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: message.includes('Error') ? '#ef4444' : '#22c55e'}}>{message}</div>}
      
      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Homepage Content</h3>
          <div style={styles.inputGroup}><label style={styles.label}>Hero Title (First Line)</label><input type="text" value={homepage.heroTitle} onChange={e => setHomepage({...homepage, heroTitle: e.target.value})} style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Hero Title (Highlighted Word)</label><input type="text" value={homepage.heroHighlight} onChange={e => setHomepage({...homepage, heroHighlight: e.target.value})} style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Hero Subtitle</label><textarea value={homepage.heroSubtitle} onChange={e => setHomepage({...homepage, heroSubtitle: e.target.value})} style={styles.textarea} rows={3} /></div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>SEO Configuration</h3>
          <div style={styles.inputGroup}><label style={styles.label}>Meta Title</label><input type="text" value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Meta Description</label><textarea value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})} style={styles.textarea} rows={2} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Keywords</label><input type="text" value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} style={styles.input} /></div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>AI Pricing Formulas (per SQFT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={styles.inputGroup}><label style={styles.label}>MS Rate</label><input type="number" value={pricing.MS} onChange={e => setPricing({...pricing, MS: e.target.value})} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>SS Rate</label><input type="number" value={pricing.SS} onChange={e => setPricing({...pricing, SS: e.target.value})} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Aluminium Rate</label><input type="number" value={pricing.Aluminium} onChange={e => setPricing({...pricing, Aluminium: e.target.value})} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Wood + Metal Rate</label><input type="number" value={pricing.WoodMetal} onChange={e => setPricing({...pricing, WoodMetal: e.target.value})} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Base Labor</label><input type="number" value={pricing.Labor} onChange={e => setPricing({...pricing, Labor: e.target.value})} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Installation</label><input type="number" value={pricing.Installation} onChange={e => setPricing({...pricing, Installation: e.target.value})} style={styles.input} /></div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact Info</h3>
          <div style={styles.inputGroup}><label style={styles.label}>Phone</label><input type="text" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>WhatsApp</label><input type="text" value={contact.whatsapp} onChange={e => setContact({...contact, whatsapp: e.target.value})} style={styles.input} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Email</label><input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} style={styles.input} /></div>
        </div>

        <div style={{display: 'flex', gap: '1rem', paddingBottom: '3rem'}}>
          <button type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
          <button type="button" onClick={seedData} style={{...styles.saveBtn, background: '#334155'}}>Demo Data</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px' },
  loading: { color: '#94a3b8', fontSize: '1.2rem' },
  title: { color: '#fff', marginBottom: '2rem', fontSize: '1.8rem' },
  alert: { padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid currentColor' },
  form: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  section: { background: '#1a1a1f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  sectionTitle: { color: '#c5a059', margin: '0 0 1rem 0', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' },
  input: { padding: '0.8rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none' },
  textarea: { padding: '0.8rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', resize: 'vertical' },
  saveBtn: { padding: '1rem', borderRadius: '8px', background: 'linear-gradient(135deg, #c5a059, #b38b3c)', color: '#fff', fontSize: '1.1rem', fontWeight: '600', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', minWidth: '150px' }
};

export default SettingsAdmin;
