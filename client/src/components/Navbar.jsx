import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Compass,
  Inbox,
  CalendarCheck,
  Coins,
  ShieldCheck,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (email) => {
    try {
      await login(email, 'Password123!');
      setDemoSwitchOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Demo switch failed:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-wrapper">
        <Link to="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <span>TimeBank <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>Learn</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={17} /> Explore Skills
              </span>
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/inbox" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Inbox size={17} /> Requests
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-sessions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CalendarCheck size={17} /> My Sessions
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-listings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <PlusCircle size={17} /> My Teaching
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/credits" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <div className="credit-pill" title="Available time credits">
                    <Coins size={15} />
                    <span>{user?.credits || 0} Credits</span>
                    {user?.heldCredits > 0 && (
                      <span className="credit-pill-held" style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                        ({user.heldCredits} on hold)
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>

              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                      <ShieldCheck size={17} /> Admin
                    </span>
                  </NavLink>
                </li>
              )}

              <li>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={17} />
                    )}
                    <span>{user?.name?.split(' ')[0]}</span>
                  </div>
                </NavLink>
              </li>

              {/* Demo Switcher Quick Menu */}
              <li style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                  onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                >
                  <Sparkles size={14} color="#6366f1" /> Demo Switch
                </button>

                {demoSwitchOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.5rem',
                      width: '210px',
                      zIndex: 60,
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', padding: '0.35rem 0.5rem' }}>
                      SWITCH DEMO USER:
                    </div>
                    <button
                      onClick={() => handleDemoSwitch('admin@timebank.org')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.825rem' }}
                      onMouseEnter={(e) => (e.target.style.background = 'var(--primary-50)')}
                      onMouseLeave={(e) => (e.target.style.background = 'none')}
                    >
                      🛡️ <strong>Admin</strong> (admin@timebank.org)
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('rahul@example.com')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.825rem' }}
                      onMouseEnter={(e) => (e.target.style.background = 'var(--primary-50)')}
                      onMouseLeave={(e) => (e.target.style.background = 'none')}
                    >
                      🎸 <strong>Rahul</strong> (Guitar & Calligraphy)
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('sneha@example.com')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.825rem' }}
                      onMouseEnter={(e) => (e.target.style.background = 'var(--primary-50)')}
                      onMouseLeave={(e) => (e.target.style.background = 'none')}
                    >
                      🎓 <strong>Sneha</strong> (Active Learner)
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('ananya@example.com')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.825rem' }}
                      onMouseEnter={(e) => (e.target.style.background = 'var(--primary-50)')}
                      onMouseLeave={(e) => (e.target.style.background = 'none')}
                    >
                      🗣️ <strong>Ananya</strong> (English Coach)
                    </button>
                  </div>
                )}
              </li>

              <li>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out" style={{ padding: '0.4rem 0.6rem' }}>
                  <LogOut size={16} />
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Quick Login button for guest evaluators */}
              <li>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDemoSwitch('rahul@example.com')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Sparkles size={14} color="#6366f1" /> Quick Demo
                </button>
              </li>
              <li>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                  Join TimeBank
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ display: 'none' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
};
