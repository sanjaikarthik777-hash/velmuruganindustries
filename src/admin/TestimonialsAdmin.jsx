import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTestimonials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'testimonials'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        role: item.role,
        text: item.text,
        rating: item.rating || 5,
        date: item.date || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        role: '',
        text: '',
        rating: 5,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), formData);
      } else {
        await addDoc(collection(db, 'testimonials'), formData);
      }
      closeModal();
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert('Error saving testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
        fetchTestimonials();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        alert('Error deleting testimonial');
      }
    }
  };

  if (loading) return <div style={{color: 'white'}}>Loading testimonials...</div>;

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
        <h2 style={styles.title}>Manage Testimonials</h2>
        <button onClick={() => openModal()} style={styles.addBtn}>
          <Plus size={20} /> Add Testimonial
        </button>
      </div>

      <div style={styles.grid}>
        {testimonials.map(item => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>{item.name}</h3>
                <p style={styles.cardRole}>{item.role}</p>
              </div>
              <div style={styles.actions}>
                <button onClick={() => openModal(item)} style={styles.iconBtn}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(item.id)} style={{...styles.iconBtn, color: '#ef4444'}}><Trash2 size={16} /></button>
              </div>
            </div>
            <div style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</div>
            <p style={styles.cardDesc}>"{item.text}"</p>
          </div>
        ))}
        {testimonials.length === 0 && <p style={{color: '#94a3b8'}}>No testimonials added yet.</p>}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
              <button onClick={closeModal} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Customer Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Role / Location</label>
                  <input 
                    type="text" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    style={styles.input}
                    placeholder="e.g. Homeowner"
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={formData.rating} 
                    onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Testimonial Text</label>
                <textarea 
                  value={formData.text} 
                  onChange={e => setFormData({...formData, text: e.target.value})}
                  style={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" style={styles.saveBtn}>
                {editingId ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: { color: '#fff', margin: 0 },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.2rem',
    background: '#c5a059',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: '#1a1a1f',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '1.5rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
  },
  cardTitle: { color: '#fff', margin: '0 0 0.2rem 0', fontSize: '1.1rem' },
  cardRole: { color: '#94a3b8', margin: 0, fontSize: '0.85rem' },
  rating: { color: '#c5a059', fontSize: '1rem', marginBottom: '1rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  iconBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: '#94a3b8',
    padding: '0.4rem',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  cardDesc: { color: '#e2e8f0', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', fontStyle: 'italic' },
  
  /* Modal Styles */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    background: '#1a1a1f',
    width: '100%',
    maxWidth: '600px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#fff'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' },
  input: {
    padding: '0.8rem',
    borderRadius: '6px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem'
  },
  textarea: {
    padding: '0.8rem',
    borderRadius: '6px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical'
  },
  saveBtn: {
    padding: '1rem',
    background: '#c5a059',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};

export default TestimonialsAdmin;
