import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const TransformAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    beforeUrl: '',
    afterUrl: '',
    title: 'Modern Gate Transformation',
    subtitle: 'See how we turn outdated structures into modern masterpieces'
  });

  const [previews, setPreviews] = useState({ before: null, after: null });
  const [files, setFiles] = useState({ before: null, after: null });

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'settings', 'transformation_spotlight');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching transformation data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const uploadImage = async (file, type) => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
    const optimized = await imageCompression(file, options);
    const sRef = ref(storage, `transformation/${type}_${Date.now()}.webp`);
    await uploadBytes(sRef, optimized);
    return await getDownloadURL(sRef);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updatedData = { ...data };
      
      if (files.before) {
        updatedData.beforeUrl = await uploadImage(files.before, 'before');
      }
      if (files.after) {
        updatedData.afterUrl = await uploadImage(files.after, 'after');
      }

      await setDoc(doc(db, 'settings', 'transformation_spotlight'), updatedData);
      setData(updatedData);
      setFiles({ before: null, after: null });
      alert("Transformation Spotlight updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving transformation spotlight.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading Spotlight Settings...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Transformation Spotlight</h2>
        <p style={styles.subtitle}>Manage the Before/After showcase seen on the homepage gallery.</p>
      </div>

      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.inputSection}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Section Title</label>
            <input 
              type="text" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})} 
              style={styles.input}
              placeholder="e.g. Transformation Spotlight"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Section Subtitle</label>
            <input 
              type="text" 
              value={data.subtitle} 
              onChange={e => setData({...data, subtitle: e.target.value})} 
              style={styles.input}
              placeholder="e.g. See how we turn outdated structures..."
            />
          </div>
        </div>

        <div style={styles.grid}>
          {/* Before Image */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Before Image</h3>
            <div style={styles.uploadArea}>
              {previews.before || data.beforeUrl ? (
                <img src={previews.before || data.beforeUrl} alt="Before Preview" style={styles.preview} />
              ) : (
                <div style={styles.placeholder}>
                  <AlertCircle size={40} color="#475569" />
                  <span>No image set</span>
                </div>
              )}
              <input 
                type="file" 
                id="before-upload" 
                onChange={e => handleFileChange('before', e)} 
                style={styles.fileInput}
                accept="image/*"
              />
              <label htmlFor="before-upload" style={styles.uploadBtn}>
                <Upload size={18} /> {files.before ? 'Change Selection' : 'Upload New'}
              </label>
            </div>
          </div>

          {/* After Image */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>After Image</h3>
            <div style={styles.uploadArea}>
              {previews.after || data.afterUrl ? (
                <img src={previews.after || data.afterUrl} alt="After Preview" style={styles.preview} />
              ) : (
                <div style={styles.placeholder}>
                  <AlertCircle size={40} color="#475569" />
                  <span>No image set</span>
                </div>
              )}
              <input 
                type="file" 
                id="after-upload" 
                onChange={e => handleFileChange('after', e)} 
                style={styles.fileInput}
                accept="image/*"
              />
              <label htmlFor="after-upload" style={styles.uploadBtn}>
                <Upload size={18} /> {files.after ? 'Change Selection' : 'Upload New'}
              </label>
            </div>
          </div>
        </div>

        <button type="submit" style={styles.saveBtn} disabled={saving}>
          {saving ? <><RefreshCw size={18} className="spin" /> Saving Changes...</> : <><Check size={18} /> Update Spotlight</>}
        </button>
      </form>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px' },
  header: { marginBottom: '2.5rem' },
  title: { color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  inputSection: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '1.5rem', 
    background: 'rgba(255,255,255,0.02)', 
    padding: '1.5rem', 
    borderRadius: '12px', 
    border: '1px solid rgba(255,255,255,0.05)' 
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { color: '#c5a059', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { padding: '0.8rem 1rem', borderRadius: '8px', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '2rem' 
  },
  card: { background: '#1a1a24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  cardTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: 600 },
  uploadArea: { position: 'relative', height: '300px', background: '#0a0a0f', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(197,160,89,0.3)' },
  preview: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#475569' },
  fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 },
  uploadBtn: { position: 'absolute', bottom: '1rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none', zIndex: 2 },
  saveBtn: { alignSelf: 'flex-start', padding: '1rem 2rem', background: '#c5a059', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.3s ease' },
  loading: { color: '#fff', textAlign: 'center', padding: '4rem' }
};

export default TransformAdmin;
