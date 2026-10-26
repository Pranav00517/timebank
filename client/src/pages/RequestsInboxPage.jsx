import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Inbox,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';

export const RequestsInboxPage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInboxSessions();
      if (res.success) {
        setIncoming(res.data?.incoming || []);
        setOutgoing(res.data?.outgoing || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load inbox requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleAccept = async (sessionId) => {
    try {
      const res = await api.acceptSession(sessionId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Session accepted! Learner credits are now held in safe escrow until both parties confirm completion.',
        });
        await refreshUser();
        await fetchInbox();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept session');
    }
  };

  const handleDecline = async (sessionId) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      const res = await api.declineSession(sessionId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Request declined. No credits were moved.',
        });
        await fetchInbox();
      }
    } catch (err) {
      setError(err.message || 'Failed to decline session');
    }
  };

  const handleCancel = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this request? Any held credits will return to your balance.')) return;
    try {
      const res = await api.cancelSession(sessionId);
      if (res.success) {
        setNotification({
          type: 'success',
          message: 'Request cancelled. Held credits returned to your available balance.',
        });
        await refreshUser();
        await fetchInbox();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel session');
    }
  };

  const pendingIncomingCount = incoming.filter((s) => s.status === 'Pending').length;
  const pendingOutgoingCount = outgoing.filter((s) => s.status === 'Pending').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Session Requests Inbox</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Manage your incoming teaching proposals and track outgoing session bookings
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

      {/* Tabs */}
      <div className="tabs-header">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Inbox size={18} />
            Incoming (As Teacher)
            {pendingIncomingCount > 0 && (
              <span style={{ background: 'var(--primary-600)', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                {pendingIncomingCount}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} />
            Outgoing (As Learner)
            {pendingOutgoingCount > 0 && (
              <span style={{ background: 'var(--slate-200)', color: 'var(--slate-700)', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                {pendingOutgoingCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading requests inbox..." />
      ) : activeTab === 'incoming' ? (
        incoming.length === 0 ? (
          <div className="state-empty">
            <div className="state-empty-icon">
              <Inbox size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Incoming Requests Yet</h3>
            <p style={{ color: 'var(--slate-500)', maxWidth: '420px', fontSize: '0.9rem' }}>
              When other community members want to learn your skill, their booking requests will appear here for you to accept or decline.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incoming.map((item) => {
              const isPending = item.status === 'Pending';
              return (
                <div key={item._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.learner?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={item.learner?.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                          {item.learner?.name}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                          Learner • {item.learner?.location || 'TimeBank Member'}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
                      Skill: {item.listing?.title}
                    </div>
                    {item.message && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                        "{item.message}"
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--slate-600)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} color="var(--primary-600)" />
                        Proposed: {new Date(item.proposedStart).toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} color="var(--primary-600)" />
                        Duration: {item.durationHours} hr ({item.durationHours} Credit to earn)
                      </span>
                    </div>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleDecline(item._id)} className="btn btn-secondary btn-sm">
                        <XCircle size={15} /> Decline
                      </button>
                      <button onClick={() => handleAccept(item._id)} className="btn btn-success btn-sm">
                        <CheckCircle size={15} /> Accept Request (Hold Credits)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : outgoing.length === 0 ? (
        <div className="state-empty">
          <div className="state-empty-icon">
            <Send size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Outgoing Requests</h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '420px', fontSize: '0.9rem' }}>
            You haven't requested any skill sessions yet. Browse available skills and send your first request!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {outgoing.map((item) => {
            const canCancel = ['Pending', 'Accepted'].includes(item.status);
            return (
              <div key={item._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={item.teacher?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={item.teacher?.name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                        {item.listing?.title}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                        Teacher: {item.teacher?.name} • {item.teacher?.location || 'TimeBank Teacher'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--slate-600)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} color="var(--primary-600)" />
                      Scheduled: {new Date(item.proposedStart).toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} color="var(--primary-600)" />
                      Cost: {item.durationHours} Credit{item.durationHours > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {canCancel && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleCancel(item._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }}>
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
