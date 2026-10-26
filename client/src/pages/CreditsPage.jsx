import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Coins,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const CreditsPage = () => {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState({ available: 0, held: 0, totalEarned: 0, totalSpent: 0 });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLedger = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCreditHistory(page, 10);
      if (res.success) {
        setBalance(res.balance || {});
        setTransactions(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, totalCount: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load credit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger(1);
  }, []);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'grant':
        return <span className="badge" style={{ background: '#d1fae5', color: '#065f46' }}>Grant</span>;
      case 'receive':
        return <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Earned (+Teaching)</span>;
      case 'hold':
        return <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Escrow Hold</span>;
      case 'release':
        return <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>Released</span>;
      case 'refund':
        return <span className="badge" style={{ background: '#fae8ff', color: '#86198f' }}>Refunded</span>;
      default:
        return <span className="badge">{type}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Time Credit Ledger</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Transparent, append-only accounting of every time credit earned, spent, and held
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Credit Metric Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        {/* Available Balance */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              Available Balance
            </span>
            <Coins size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#065f46' }}>
            {balance.available}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Hours available to book learning
          </p>
        </div>

        {/* Held in Escrow */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              Credits on Hold
            </span>
            <Lock size={20} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#92400e' }}>
            {balance.held}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Reserved for accepted sessions
          </p>
        </div>

        {/* Total Earned */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              Total Hours Earned
            </span>
            <ArrowUpRight size={20} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            {balance.totalEarned}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            From teaching & initial grant
          </p>
        </div>

        {/* Total Spent */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--slate-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              Total Hours Spent
            </span>
            <ArrowDownLeft size={20} color="var(--slate-500)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-800)' }}>
            {balance.totalSpent}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
            Invested in personal learning
          </p>
        </div>
      </div>

      {/* Append-only Ledger Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Append-Only Ledger Records</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
              Immutable transaction log reconciled directly against database state
            </p>
          </div>
          <button onClick={() => fetchLedger(pagination.page)} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching ledger records..." />
        ) : transactions.length === 0 ? (
          <div className="state-empty" style={{ margin: '2rem' }}>
            <FileText size={32} color="var(--slate-400)" />
            <p style={{ marginTop: '0.5rem', color: 'var(--slate-500)' }}>No credit transactions found.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Description / Session</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isPositive = ['grant', 'receive', 'refund'].includes(tx.type);
                  return (
                    <tr key={tx._id}>
                      <td style={{ color: 'var(--slate-500)', whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td>{getTypeBadge(tx.type)}</td>
                      <td style={{ fontWeight: 700, color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {isPositive ? `+${tx.amount}` : `-${tx.amount}`} Credit{tx.amount > 1 ? 's' : ''}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {tx.balanceAfter} Credit{tx.balanceAfter !== 1 ? 's' : ''}
                      </td>
                      <td style={{ color: 'var(--slate-700)', fontSize: '0.85rem' }}>
                        {tx.notes || (tx.session?.listing?.title ? `Session: ${tx.session.listing.title}` : 'Platform Credit Movement')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total entries)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLedger(pagination.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLedger(pagination.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
