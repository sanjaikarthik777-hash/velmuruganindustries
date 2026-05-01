import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Gates',
    icon: 'Shield',
    order: 0
  });

  const categories = ['Gates', 'Sheds', 'Fabrication Steps'];

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        icon: service.icon,
        order: service.order || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        category: 'Gates',
        icon: 'Shield',
        order: services.length
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
        await updateDoc(doc(db, 'services', editingId), formData);
      } else {
        await addDoc(collection(db, 'services'), formData);
      }
      closeModal();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      alert('Error saving service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        alert('Error deleting service');
      }
    }
  };

  if (loading) return <div style={{color: 'white'}}>Loading services...</div>;

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
        <h2 style={styles.title}>Manage Services</h2>
        <button onClick={() => openModal()} style={styles.addBtn}>
          <Plus size={20} /> Add Service
        </button>
      </div>

      <div style={styles.grid}>
        {services.map(service => (
          <div key={service.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.badge}>{service.category}</span>
              <div style={styles.actions}>
                <button onClick={() => openModal(service)} style={styles.iconBtn}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(service.id)} style={{...styles.iconBtn, color: '#ef4444'}}><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 style={styles.cardTitle}>{service.title}</h3>
            <p style={styles.cardDesc}>{service.description}</p>
          </div>
        ))}
        {services.length === 0 && <p style={{color: '#94a3b8'}}>No services added yet.</p>}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={closeModal} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  style={styles.input}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Service Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.label}>Icon Name (e.g. Shield, Home)</label>
                  <input 
                    type="text" 
                    value={formData.icon} 
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={{...styles.inputGroup, flex: 1}}>
                  <label style={styles.label}>Display Order</label>
                  <input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" style={styles.saveBtn}>
                {editingId ? 'Update Service' : 'Create Service'}
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
    alignItems: 'center',
    marginBottom: '1rem'
  },
  badge: {
    background: 'rgba(197, 160, 89, 0.15)',
    color: '#c5a059',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
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
  cardTitle: { color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.2rem' },
  cardDesc: { color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  
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

export default ServicesAdmin;
