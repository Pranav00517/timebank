import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Alert } from './Alert';
import { Clock, Calendar, MessageSquare, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const RequestModal = ({ listing, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [proposedStart, setProposedStart] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!listing) return null;

  const cost = listing.durationHours || 1;
  const userBalance = user?.credits || 0;
  const hasEnoughCredits = userBalance >= cost;
  const isOwnListing = user && listing.owner?._id === user.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isOwnListing) {
      setError('You cannot request a session on your own listing (BR-6).');
      return;
    }

    if (!hasEnoughCredits) {
      setError(`Insufficient credits. You need ${cost} credit(s) but currently have ${userBalance}. Earn credits by teaching first! (BR-1)`);
      return;
    }

    if (!proposedStart) {
      setError('Please select a proposed date and time.');
      return;
    }

    const selectedTime = new Date(proposedStart).getTime();
    if (isNaN(selectedTime) || selectedTime <= Date.now()) {
      setError('Please select a future date and time for the session.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestSession({
        listingId: listing._id,
        proposedStart,
        message,
      });

      if (res.success) {
        await refreshUser();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit session request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Request Skill Session</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{listing.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {/* Credit rules reminder box */}
          <div
            style={{
              background: hasEnoughCredits ? 'var(--primary-50)' : 'var(--accent-amber-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            {hasEnoughCredits ? (
              <Clock size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: hasEnoughCredits ? 'var(--primary-800)' : '#92400e' }}>
                Session Length: {cost} Hour{cost > 1 ? 's' : ''} ({cost} Credit{cost > 1 ? 's' : ''})
              </div>
              <div style={{ color: hasEnoughCredits ? 'var(--primary-700)' : '#78350f', marginTop: '0.2rem' }}>
                Your available balance: <strong>{userBalance} credit{userBalance !== 1 ? 's' : ''}</strong>.
                Credits are only held when the teacher accepts your request.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="proposedStart">
              Proposed Date & Time *
            </label>
            <input
              id="proposedStart"
              type="datetime-local"
              className="form-input"
              value={proposedStart}
              onChange={(e) => setProposedStart(e.target.value)}
              required
            />
            {listing.availabilityNotes && (
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                💡 Teacher availability note: "{listing.availabilityNotes}"
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">
              Message for Teacher
            </label>
            <textarea
              id="message"
              className="form-textarea"
              rows={3}
              placeholder="Introduce your goals, background, and what you hope to learn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasEnoughCredits || isOwnListing}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
