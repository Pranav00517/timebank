import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Plus,
  Edit2,
  Trash2,
  Pause,
  Play,
  Clock,
  Sparkles,
  BookOpen,
  X,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'Music',
  'Languages',
  'Technology',
  'Media & Design',
  'Arts & Crafts',
  'Academics',
  'Cooking & Lifestyle',
];

export const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [durationHours, setDurationHours] = useState(1);
  const [mode, setMode] = useState('online');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyListings();
      if (res.success) {
        setListings(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const openCreateModal = () => {
    setEditingListing(null);
    setTitle('');
    setCategory('Technology');
    setDescription('');
    setDurationHours(1);
    setMode('online');
    setAvailabilityNotes('');
    setModalOpen(true);
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setTitle(listing.title);
    setCategory(listing.category);
    setDescription(listing.description);
    setDurationHours(listing.durationHours);
    setMode(listing.mode);
    setAvailabilityNotes(listing.availabilityNotes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      category,
      description,
      durationHours: Number(durationHours),
      mode,
      availabilityNotes,
    };

    try {
      if (editingListing) {
        const res = await api.updateListing(editingListing._id, payload);
        if (res.success) {
          setNotification({ type: 'success', message: 'Skill listing updated successfully!' });
        }
      } else {
        const res = await api.createListing(payload);
        if (res.success) {
          setNotification({ type: 'success', message: 'New skill listing published! It is now live in search.' });
        }
      }
      setModalOpen(false);
      await fetchMyListings();
    } catch (err) {
      setError(err.message || 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (listing) => {
    try {
      const res = await api.updateListing(listing._id, { isActive: !listing.isActive });
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Listing is now ${!listing.isActive ? 'Active and visible in search' : 'Paused and hidden from search'}`,
        });
        await fetchMyListings();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle listing status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteListing(id);
      setNotification({ type: 'success', message: 'Listing permanently removed' });
      await fetchMyListings();
    } catch (err) {
      setError(err.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>My Teaching Listings</h1>
          <p style={{ color: 'var(--slate-500)' }}>
            Share your knowledge with others. When you teach a session, you earn time credits!
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Offer a New Skill
        </button>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {loading ? (
        <LoadingSpinner text="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="state-empty">
          <div className="state-empty-icon">
            <BookOpen size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You Haven't Listed Any Skills Yet</h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            What can you teach? Guitar, English conversation, graphic design, math tutoring, or baking?
            Every hour you teach awards you 1 credit to spend learning something new.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} /> Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {listings.map((l) => (
            <div key={l._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-category">{l.category}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: l.isActive ? 'var(--accent-emerald-light)' : 'var(--slate-200)',
                    color: l.isActive ? '#065f46' : 'var(--slate-600)',
                  }}
                >
                  {l.isActive ? 'Active' : 'Paused'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{l.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.5', flex: 1, marginBottom: '1rem' }}>
                {l.description}
              </p>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)', padding: '0.75rem 0', borderTop: '1px solid var(--slate-100)', marginBottom: '1rem' }}>
                <span>Length: <strong>{l.durationHours} hr ({l.durationHours} credit)</strong></span>
                <span>Mode: <strong style={{ textTransform: 'capitalize' }}>{l.mode}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => openEditModal(l)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(l)}
                  className={`btn btn-sm ${l.isActive ? 'btn-secondary' : 'btn-success'}`}
                  style={{ flex: 1 }}
                >
                  {l.isActive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Activate</>}
                </button>
                <button onClick={() => handleDelete(l._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingListing ? 'Edit Skill Listing' : 'Offer a New Skill to Teach'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="listingTitle">
                  Skill Title *
                </label>
                <input
                  id="listingTitle"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Beginners Acoustic Guitar Fingerstyle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="listingCategory">
                    Category *
                  </label>
                  <select
                    id="listingCategory"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="durationHours">
                    Session Length * (Credits)
                  </label>
                  <select
                    id="durationHours"
                    className="form-select"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                  >
                    <option value={1}>1 Hour (1 Credit)</option>
                    <option value={2}>2 Hours (2 Credits)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="listingMode">
                  Delivery Mode *
                </label>
                <select
                  id="listingMode"
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="online">Online (Google Meet / Zoom link)</option>
                  <option value="in person">In Person</option>
                  <option value="both">Both (Online or In Person)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="listingDescription">
                  Description of What You Teach *
                </label>
                <textarea
                  id="listingDescription"
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe your lesson structure, what learners should bring, and who this is suitable for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="availabilityNotes">
                  Availability Notes (Optional)
                </label>
                <input
                  id="availabilityNotes"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Weekday evenings after 7 PM, or weekends"
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingListing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
