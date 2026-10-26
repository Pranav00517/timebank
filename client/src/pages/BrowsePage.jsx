import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/ListingCard';
import { RequestModal } from '../components/RequestModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Search, Filter, Compass, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Music',
  'Languages',
  'Technology',
  'Media & Design',
  'Arts & Crafts',
  'Academics',
  'Cooking & Lifestyle',
];

export const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state from URL or defaults
  const queryParam = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const modeParam = searchParams.get('mode') || 'all';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [searchInput, setSearchInput] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedMode, setSelectedMode] = useState(modeParam);

  // Request modal state
  const [selectedListingForRequest, setSelectedListingForRequest] = useState(null);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getListings({
        query: queryParam,
        category: categoryParam,
        mode: modeParam,
        page: pageParam,
        limit: 9,
      });

      if (res.success) {
        setListings(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, totalCount: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load skill listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('query', searchInput.trim());
    } else {
      newParams.delete('query');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const newParams = new URLSearchParams(searchParams);
    if (mode === 'all') {
      newParams.delete('mode');
    } else {
      newParams.set('mode', mode);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestClick = (listing) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/browse' } } });
      return;
    }
    setSelectedListingForRequest(listing);
  };

  const handleRequestSuccess = () => {
    setSelectedListingForRequest(null);
    setRequestSuccessMessage('Session requested successfully! The teacher will receive it in their requests inbox.');
    setTimeout(() => setRequestSuccessMessage(null), 6000);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Title & Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Explore Community Skills</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '1rem' }}>
          Swap time credits with peers. Learn guitar, coding, languages, video editing, and more.
        </p>
      </div>

      {requestSuccessMessage && (
        <Alert type="success" message={requestSuccessMessage} onClose={() => setRequestSuccessMessage(null)} />
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search skill title or description (e.g. Guitar, Python, English)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={selectedMode}
              onChange={(e) => handleModeChange(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="in person">In Person</option>
              <option value="both">Both (Online/In Person)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = (selectedCategory === cat) || (!selectedCategory && cat === 'All');
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--slate-200)',
                  background: isSelected ? 'var(--primary-50)' : 'white',
                  color: isSelected ? 'var(--primary-700)' : 'var(--slate-600)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 States handling (SRS Section 3.1) */}
      {loading ? (
        <LoadingSpinner text="Searching skills..." />
      ) : error ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Failed to Load Listings</h3>
          <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchListings} className="btn btn-primary">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="state-empty">
          <div className="state-empty-icon">
            <Compass size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Skill Listings Found</h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            We couldn't find any active listings matching your search or category filter. Try clearing filters or list your own skill to start teaching!
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSelectedCategory('All');
              setSelectedMode('all');
              setSearchParams({});
            }}
            className="btn btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
              Showing {listings.length} of {pagination.totalCount} listings
            </span>
          </div>

          <div className="grid grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onRequest={handleRequestClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`btn btn-sm ${pagination.page === p ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '36px' }}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {selectedListingForRequest && (
        <RequestModal
          listing={selectedListingForRequest}
          onClose={() => setSelectedListingForRequest(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};
