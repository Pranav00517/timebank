import React, { useState } from 'react';
import { api } from '../services/api';
import { StarRating } from './StarRating';
import { Alert } from './Alert';
import { Award, X } from 'lucide-react';

export const ReviewModal = ({ session, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a star rating between 1 and 5');
      return;
    }

    setLoading(true);
    try {
      const res = await api.reviewSession(session._id, {
        rating,
        comment,
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="var(--primary-600)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Review Teacher</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Session with {session.teacher?.name || 'Teacher'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
              How was your learning experience?
            </label>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <StarRating rating={rating} interactive={true} onRatingChange={setRating} size={32} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-600)', marginTop: '0.4rem' }}>
              {rating === 5 && '🌟 Exceptional! Very helpful.'}
              {rating === 4 && '👍 Great session! Learned a lot.'}
              {rating === 3 && '👌 Good session. Met expectations.'}
              {rating === 2 && '😕 Mediocre. Room for improvement.'}
              {rating === 1 && '⚠️ Unsatisfactory session.'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reviewComment">
              Written Feedback (Optional)
            </label>
            <textarea
              id="reviewComment"
              className="form-textarea"
              rows={4}
              placeholder="What did you learn? How was the teaching style and clarity?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
