import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { RequestModal } from '../components/RequestModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import {
  Clock,
  MapPin,
  Video,
  Users,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Award,
  User,
} from 'lucide-react';

export const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getListingById(id);
      if (res.success) {
        setListing(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleRequestSuccess = () => {
    setIsModalOpen(false);
    setSuccessMessage('Your session request has been submitted! You can track its status in your Requests Inbox.');
  };

  if (loading) return <LoadingSpinner text="Loading skill details..." />;

  if (error || !listing) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Listing Not Found</h2>
        <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>{error || 'The requested skill listing could not be found.'}</p>
        <Link to="/browse" className="btn btn-primary">
          <ChevronLeft size={16} /> Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user && listing.owner?._id === user.id;
  const userBalance = user?.credits || 0;
  const hasCredits = userBalance >= listing.durationHours;

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ChevronLeft size={16} /> Back to all skills
      </Link>

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-category">{listing.category}</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--slate-500)',
                background: 'var(--slate-100)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              Mode: {listing.mode}
            </span>
          </div>

          <h1 style={{ fontSize: '2.25rem', lineHeight: 1.25, marginBottom: '1.5rem', color: 'var(--slate-900)' }}>
            {listing.title}
          </h1>

          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>About This Skill & Session</h3>
            <p style={{ color: 'var(--slate-700)', lineHeight: '1.8', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
              {listing.description}
            </p>

            {listing.availabilityNotes && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--primary-600)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                  Availability Notes
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>{listing.availabilityNotes}</div>
              </div>
            )}
          </div>

          {/* Teacher Reviews Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Teacher Reviews & Feedback</h3>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>From verified learners who completed sessions</p>
              </div>
              <StarRating rating={listing.teacherStats?.avgRating || 0} count={listing.teacherStats?.count || 0} size={18} />
            </div>

            {(!listing.teacherStats?.reviews || listing.teacherStats.reviews.length === 0) ? (
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No reviews yet for this teacher. Be the first to book a session and leave a review!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {listing.teacherStats.reviews.map((rev) => (
                  <div key={rev._id} style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={rev.learner?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={rev.learner?.name || 'Learner'}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rev.learner?.name || 'Learner'}</span>
                      </div>
                      <StarRating rating={rev.rating} size={14} />
                    </div>
                    {rev.comment && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', fontStyle: 'italic' }}>
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Teacher Card & Request Action */}
        <div>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img
                src={listing.owner?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={listing.owner?.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{listing.owner?.name}</h3>
              {listing.owner?.location && (
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <MapPin size={13} /> {listing.owner.location}
                </p>
              )}
            </div>

            {listing.owner?.bio && (
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', textAlign: 'center', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                "{listing.owner.bio}"
              </p>
            )}

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Session Length:</span>
                <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                  {listing.durationHours} Hour{listing.durationHours > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Cost:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                  {listing.durationHours} Credit{listing.durationHours > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Delivery:</span>
                <span style={{ fontWeight: 600, color: 'var(--slate-700)', textTransform: 'capitalize' }}>
                  {listing.mode}
                </span>
              </div>
            </div>

            {isOwner ? (
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                You are the teacher of this listing.
              </div>
            ) : (
              <div>
                <button
                  onClick={handleBookClick}
                  disabled={isAuthenticated && !hasCredits}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  <Calendar size={17} /> Request This Session
                </button>

                {isAuthenticated && !hasCredits && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', textAlign: 'center' }}>
                    ⚠️ You need {listing.durationHours} credits, but only have {userBalance} available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RequestModal
          listing={listing}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};
