import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReviewModal } from '../components/ReviewModal';
import { StarRating } from '../components/StarRating';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  Video,
  ShieldAlert,
  X,
  MessageSquare,
} from 'lucide-react';

export const MySessionsPage = () => {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Review modal state
  const [reviewingSession, setReviewingSession] = useState(null);

  // Dispute modal state
  const [disputeSession, setDisputeSession] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMySessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleConfirm = async (sessionId) => {
    try {
      const res = await api.confirmSession(sessionId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Confirmation recorded!',
        });
        await refreshUser();
        await fetchSessions();
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm session');
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeSession) return;
    setDisputing(true);
    try {
      const res = await api.reportDispute(disputeSession._id, { reason: disputeReason });
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Session marked as Disputed. Platform administration has been notified and credits will stay securely on hold.',
        });
        setDisputeSession(null);
        setDisputeReason('');
        await fetchSessions();
      }
    } catch (err) {
      setError(err.message || 'Failed to report dispute');
    } finally {
      setDisputing(false);
    }
  };

  const handleReviewSuccess = async () => {
    setReviewingSession(null);
    setNotification({
      type: 'success',
      message: 'Thank you! Your feedback and rating have been recorded.',
    });
    await fetchSessions();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>My Skill Sessions</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Confirm session completion to release credits, report issues, and submit teacher reviews
        </p>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner text="Loading your sessions..." />
      ) : sessions.length === 0 ? (
        <div className="state-empty">
          <div className="state-empty-icon">
            <CalendarCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Sessions Found</h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '420px', fontSize: '0.9rem' }}>
            Accepted and completed sessions will appear here. Once you finish a session, both you and your partner confirm it to release credits!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sessions.map((session) => {
            const isTeacher = user && session.teacher?._id === user.id;
            const isLearner = user && session.learner?._id === user.id;
            const partner = isTeacher ? session.learner : session.teacher;
            const partnerRole = isTeacher ? 'Learner' : 'Teacher';
            const userHasConfirmed = isTeacher ? session.teacherConfirmed : session.learnerConfirmed;
            const partnerHasConfirmed = isTeacher ? session.learnerConfirmed : session.teacherConfirmed;

            return (
              <div key={session._id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={partner?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={partner?.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{session.listing?.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                        {partnerRole}: <strong>{partner?.name}</strong> • You are the <strong>{isTeacher ? 'Teacher' : 'Learner'}</strong>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={session.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700 }}>Time & Date</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                      {new Date(session.proposedStart).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700 }}>Session Length</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                      {session.durationHours} Hour{session.durationHours > 1 ? 's' : ''} ({session.durationHours} Credit{session.durationHours > 1 ? 's' : ''})
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700 }}>Two-Sided Confirmation</span>
                    <div style={{ fontSize: '0.825rem', marginTop: '0.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: session.teacherConfirmed ? 'var(--accent-emerald)' : 'var(--slate-500)', fontWeight: 600 }}>
                        {session.teacherConfirmed ? '✓ Teacher confirmed' : '⏳ Teacher pending'}
                      </span>
                      <span>•</span>
                      <span style={{ color: session.learnerConfirmed ? 'var(--accent-emerald)' : 'var(--slate-500)', fontWeight: 600 }}>
                        {session.learnerConfirmed ? '✓ Learner confirmed' : '⏳ Learner pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispute details if disputed */}
                {session.status === 'Disputed' && (
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--accent-rose-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9f1239', fontWeight: 700, fontSize: '0.85rem' }}>
                      <ShieldAlert size={16} /> Session Under Admin Review
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#881337', marginTop: '0.25rem' }}>
                      Reason: "{session.disputeReason || 'Problem reported by participant'}"
                    </div>
                  </div>
                )}

                {/* Review if already reviewed */}
                {session.review && (
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                        Feedback Submitted:
                      </span>
                      <StarRating rating={session.review.rating} size={14} />
                    </div>
                    {session.review.comment && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary-900)', fontStyle: 'italic' }}>
                        "{session.review.comment}"
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {session.status === 'Accepted' && (
                    <>
                      <button
                        onClick={() => setDisputeSession(session)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <ShieldAlert size={14} /> Report Issue
                      </button>

                      <button
                        onClick={() => handleConfirm(session._id)}
                        disabled={userHasConfirmed}
                        className={`btn btn-sm ${userHasConfirmed ? 'btn-secondary' : 'btn-success'}`}
                      >
                        <CheckCircle size={15} />
                        {userHasConfirmed ? 'You Confirmed (Waiting for Partner)' : 'Confirm Session Finished'}
                      </button>
                    </>
                  )}

                  {session.status === 'Completed' && isLearner && !session.review && (
                    <button
                      onClick={() => setReviewingSession(session)}
                      className="btn btn-primary btn-sm"
                    >
                      <Award size={15} /> Leave Teacher Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingSession && (
        <ReviewModal
          session={reviewingSession}
          onClose={() => setReviewingSession(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Dispute Modal */}
      {disputeSession && (
        <div className="modal-overlay" onClick={() => setDisputeSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)' }}>
                <ShieldAlert size={20} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Report Session Problem</h3>
              </div>
              <button onClick={() => setDisputeSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                Flagging a dispute will freeze the session. Credits will stay safely in escrow until the platform administrator reviews the case.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="disputeReason">
                  Explain the problem *
                </label>
                <textarea
                  id="disputeReason"
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. The participant did not attend the scheduled session, or there was a technical conflict..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setDisputeSession(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={disputing} className="btn btn-danger">
                  {disputing ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
