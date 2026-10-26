import React from 'react';
import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';
import { Clock, MapPin, Video, Users, Sparkles } from 'lucide-react';

export const ListingCard = ({ listing, onRequest }) => {
  const { _id, title, category, description, durationHours, mode, owner, teacherStats } = listing;

  const modeIcon = () => {
    if (mode === 'online') return <Video size={13} />;
    if (mode === 'in person') return <Users size={13} />;
    return <Sparkles size={13} />;
  };

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.25rem 1.25rem 0.75rem', flex: 1 }}>
        {/* Top badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span className="badge badge-category">{category}</span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--slate-500)',
                background: 'var(--slate-100)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              {modeIcon()} {mode}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary-700)',
                background: 'var(--primary-50)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
              }}
            >
              <Clock size={13} /> {durationHours} {durationHours === 1 ? 'Credit' : 'Credits'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/listings/${_id}`}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--slate-900)',
              marginBottom: '0.5rem',
              lineHeight: 1.35,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--primary-600)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--slate-900)')}
          >
            {title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--slate-600)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* Teacher details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
          <img
            src={owner?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={owner?.name || 'Teacher'}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {owner?.name}
            </div>
            {owner?.location && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <MapPin size={11} /> {owner.location}
              </div>
            )}
          </div>
          <StarRating rating={teacherStats?.avgRating || 0} count={teacherStats?.count || 0} size={14} />
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ padding: '0.75rem 1.25rem 1.25rem', display: 'flex', gap: '0.5rem', background: '#fafbfc' }}>
        <Link to={`/listings/${_id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          View Details
        </Link>
        {onRequest && (
          <button onClick={() => onRequest(listing)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            Request Session
          </button>
        )}
      </div>
    </div>
  );
};
