import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  ShieldCheck,
  Users,
  BookOpen,
  ShieldAlert,
  FileText,
  UserX,
  UserCheck,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'listings' | 'disputes' | 'logs'

  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [logsList, setLogsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Dispute resolution modal state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolveAction, setResolveAction] = useState('refund_learner');
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, lRes, dRes, logRes] = await Promise.all([
        api.listUsers(1, 50),
        api.listAllListings(),
        api.getDisputedSessions(),
        api.getAdminLogs(),
      ]);

      if (uRes.success) setUsersList(uRes.data || []);
      if (lRes.success) setListingsList(lRes.data || []);
      if (dRes.success) setDisputesList(dRes.data || []);
      if (logRes.success) setLogsList(logRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (targetUser) => {
    const isSuspending = targetUser.status === 'active';
    const confirmMsg = isSuspending
      ? `Are you sure you want to SUSPEND ${targetUser.name}? They will immediately be logged out and cannot log back in.`
      : `Are you sure you want to REINSTATE ${targetUser.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.toggleSuspendUser(targetUser._id, {
        note: `Admin toggled status via dashboard`,
      });
      if (res.success) {
        setNotification({
          type: 'success',
          message: `User ${targetUser.name} has been ${isSuspending ? 'suspended' : 'reinstated'}.`,
        });
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle user suspension');
    }
  };

  const handleToggleListingActive = async (listing) => {
    try {
      const res = await api.moderateListing(listing._id, {
        isActive: !listing.isActive,
        note: `Admin toggled active state to ${!listing.isActive}`,
      });
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Listing active status set to ${!listing.isActive}.`,
        });
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to moderate listing');
    }
  };

  const handleResolveDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setResolving(true);
    try {
      const res = await api.resolveDispute(selectedDispute._id, {
        action: resolveAction,
        note: resolveNote,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: `Dispute resolved successfully! Credits have been ${resolveAction === 'refund_learner' ? 'refunded to the learner' : 'released to the teacher'}.`,
        });
        setSelectedDispute(null);
        setResolveNote('');
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <ShieldCheck size={24} color="var(--primary-600)" />
            <h1 style={{ fontSize: '2.25rem' }}>Governance & Admin Moderation</h1>
          </div>
          <p style={{ color: 'var(--slate-500)' }}>
            Oversee platform community safety, user standing, content moderation, and dispute arbitration
          </p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RotateCcw size={15} /> Refresh Dashboard
        </button>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Users
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>{usersList.length}</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Listings
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.2rem' }}>
            {listingsList.filter((l) => l.isActive).length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Disputed Sessions
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: disputesList.length > 0 ? 'var(--accent-rose)' : 'var(--slate-800)', marginTop: '0.2rem' }}>
            {disputesList.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Admin Audit Logs
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
            {logsList.length}
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="tabs-header">
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} /> User Management ({usersList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} /> Listings Moderation ({listingsList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={16} /> Disputed Sessions ({disputesList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} /> Audit Trail ({logsList.length})
          </span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading admin data..." />
      ) : activeTab === 'users' ? (
        /* Users Table */
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Credits Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const isCurrent = user?.id === u._id;
                  const isSuspended = u.status === 'suspended';
                  return (
                    <tr key={u._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </td>
                      <td style={{ color: 'var(--slate-600)' }}>{u.email}</td>
                      <td>
                        <span className="badge" style={{ background: u.role === 'admin' ? 'var(--primary-100)' : 'var(--slate-100)', color: u.role === 'admin' ? 'var(--primary-800)' : 'var(--slate-700)' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <strong>{u.credits}</strong> ({u.heldCredits} held)
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: isSuspended ? 'var(--accent-rose-light)' : 'var(--accent-emerald-light)',
                            color: isSuspended ? '#9f1239' : '#065f46',
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-secondary'}`}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          >
                            {isSuspended ? (
                              <><UserCheck size={13} /> Reinstate</>
                            ) : (
                              <><UserX size={13} /> Suspend</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'listings' ? (
        /* Listings Moderation */
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Teacher</th>
                  <th>Length</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listingsList.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{l.title}</td>
                    <td><span className="badge badge-category">{l.category}</span></td>
                    <td style={{ color: 'var(--slate-700)' }}>{l.owner?.name || 'Unknown'}</td>
                    <td>{l.durationHours} hr</td>
                    <td>
                      <span className={`badge ${l.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        {l.isActive ? 'Active' : 'Unpublished'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleListingActive(l)}
                        className={`btn btn-sm ${l.isActive ? 'btn-secondary' : 'btn-success'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        {l.isActive ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'disputes' ? (
        /* Disputed Sessions */
        disputesList.length === 0 ? (
          <div className="state-empty">
            <CheckCircle size={32} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>No Disputed Sessions</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              All peer exchange sessions are running smoothly with no reported conflicts.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {disputesList.map((session) => (
              <div key={session._id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-rose)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Skill: {session.listing?.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                      Teacher: <strong>{session.teacher?.name}</strong> • Learner: <strong>{session.learner?.name}</strong>
                    </div>
                  </div>
                  <span className="badge badge-disputed">Disputed</span>
                </div>

                <div style={{ background: 'var(--accent-rose-light)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9f1239' }}>Reported Problem:</div>
                  <div style={{ fontSize: '0.875rem', color: '#881337', marginTop: '0.2rem' }}>
                    "{session.disputeReason || 'Participant filed dispute'}"
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Held in Escrow: <strong>{session.durationHours} Credit{session.durationHours > 1 ? 's' : ''}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDispute(session);
                      setResolveAction('refund_learner');
                      setResolveNote('');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Arbitrate / Resolve Dispute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Audit Logs */
        <div className="card">
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logsList.map((log) => (
                  <tr key={log._id}>
                    <td style={{ color: 'var(--slate-500)', whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.admin?.name || 'Admin'}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary-800)' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{log.targetType}</td>
                    <td style={{ color: 'var(--slate-600)', fontSize: '0.85rem' }}>{log.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Admin Dispute Resolution</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Session: {selectedDispute.listing?.title} ({selectedDispute.durationHours} Credits)
              </p>
            </div>

            <form onSubmit={handleResolveDisputeSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Arbitration Decision *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="resolveAction"
                      value="refund_learner"
                      checked={resolveAction === 'refund_learner'}
                      onChange={(e) => setResolveAction(e.target.value)}
                    />
                    <span>
                      <strong>Refund Learner:</strong> Return held credits ({selectedDispute.durationHours}) back to learner ({selectedDispute.learner?.name}).
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="resolveAction"
                      value="release_teacher"
                      checked={resolveAction === 'release_teacher'}
                      onChange={(e) => setResolveAction(e.target.value)}
                    />
                    <span>
                      <strong>Release to Teacher:</strong> Confirm completion and release credits to teacher ({selectedDispute.teacher?.name}).
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="resolveNote">
                  Audit Log Note *
                </label>
                <textarea
                  id="resolveNote"
                  className="form-textarea"
                  rows={3}
                  placeholder="Record rationale for audit trail..."
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setSelectedDispute(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={resolving} className="btn btn-primary">
                  {resolving ? 'Executing...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
