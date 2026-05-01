import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Trash2, Plus, X, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const GalleryAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'gates',
    material: 'MS'
  });
  const [files, setFiles] = useState([]);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'gates', label: 'Gates & Fences' },
    { id: 'sheds', label: 'Industrial Sheds' },
    { id: 'railings', label: 'Stair Railings' },
    { id: 'custom', label: 'Custom Fabrication' }
  ];

  const materials = ['MS', 'SS', 'Aluminium', 'Wood'];

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      setImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, []);

  const openModal = () => {
    setFormData({ title: '', category: 'gates', material: 'MS' });
    setFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFiles([]);
    setCompressionProgress(0);
  };

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Select images");
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1280, useWebWorker: true, fileType: 'image/webp' };
        const optimized = await imageCompression(file, options);
        setCompressionProgress(Math.round(((i + 1) / files.length) * 100));

        const sRef = ref(storage, `gallery/${Date.now()}_${i}.webp`);
        await uploadBytes(sRef, optimized);
        const url = await getDownloadURL(sRef);

        await addDoc(collection(db, 'gallery'), {
          title: formData.title || file.name.split('.')[0],
          category: formData.category,
          material: formData.material,
          imageUrl: url,
          storagePath: sRef.fullPath,
          timestamp: new Date()
        });
      }
      closeModal();
      fetchImages();
    } catch (error) { alert(error.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      if (item.storagePath) await deleteObject(ref(storage, item.storagePath));
      await deleteDoc(doc(db, 'gallery', item.id));
      fetchImages();
    } catch (error) { alert('Error deleting'); }
  };

  if (loading) return <div style={{color: 'white'}}>Loading gallery...</div>;

  return (
    <div>
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={styles.title}>Manage Gallery</h2>
        <button onClick={openModal} style={styles.addBtn}><Plus size={20} /> Upload Image(s)</button>
      </div>

      <div style={styles.grid}>
        {images.map(item => (
          <div key={item.id} style={styles.card}>
            <div style={styles.imgContainer}>
              <img src={item.imageUrl} alt={item.title} style={styles.img} />
              <div style={styles.imgOverlay}>
                <button onClick={() => handleDelete(item)} style={styles.deleteBtn}><Trash2 size={20} /></button>
              </div>
            </div>
            <div style={styles.cardInfo}>
              <span style={styles.badge}>{item.category} • {item.material}</span>
              <h3 style={styles.cardTitle}>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Upload & Optimize</h3>
              <button onClick={closeModal} style={styles.closeBtn}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fileUploadArea}>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} style={styles.fileInput} id="file-upload" />
                <label htmlFor="file-upload" style={styles.fileLabel}>
                  <Upload size={32} style={{marginBottom: '0.5rem', color: '#c5a059'}} />
                  <span>{files.length > 0 ? `${files.length} images selected` : 'Select images'}</span>
                </label>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.input}>
                  {categories.filter(c => c.id !== 'all').map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Material</label>
                <select value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} style={styles.input}>
                  {materials.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button type="submit" style={styles.saveBtn} disabled={uploading}>
                {uploading ? `Processing... ${compressionProgress}%` : 'Optimize & Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { color: '#fff', margin: 0 },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#c5a059', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' },
  card: { background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' },
  imgContainer: { position: 'relative', height: '200px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', padding: '0.5rem' },
  deleteBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  cardInfo: { padding: '1rem' },
  badge: { background: 'rgba(197, 160, 89, 0.15)', color: '#c5a059', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', display: 'inline-block' },
  cardTitle: { color: '#fff', margin: 0, fontSize: '1rem' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#1a1a1f', width: '100%', maxWidth: '500px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' },
  closeBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  form: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  fileUploadArea: { border: '2px dashed rgba(197, 160, 89, 0.5)', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: 'rgba(197, 160, 89, 0.05)', position: 'relative' },
  fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
  fileLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#e2e8f0' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: '#94a3b8', fontSize: '0.9rem' },
  input: { padding: '0.8rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' },
  saveBtn: { padding: '1rem', background: '#c5a059', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
};

export default GalleryAdmin;
