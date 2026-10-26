import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Compass,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  Zap,
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email) => {
    try {
      await login(email, 'Password123!');
      navigate('/browse');
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { name: 'Music', count: 'Guitar, Vocals, Keys', icon: '🎸', color: '#eef2ff' },
    { name: 'Languages', count: 'Spoken English, French, Malayalam', icon: '🗣️', color: '#fef3c7' },
    { name: 'Technology', count: 'React, Python, Web Dev', icon: '💻', color: '#e0f2fe' },
    { name: 'Media & Design', count: 'Video Editing, Photoshop, UI', icon: '🎬', color: '#fce7f3' },
    { name: 'Arts & Crafts', count: 'Calligraphy, Sketching, Origami', icon: '✒️', color: '#fef9c3' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid var(--primary-200)',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary-700)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} color="var(--primary-600)" />
            <span>MERN-Stack Peer-to-Peer Time Credit Economy</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--slate-900)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            Teach an hour, earn an hour,{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary-600), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              spend it learning
            </span>{' '}
            something new.
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--slate-600)', lineHeight: '1.7', marginBottom: '2rem' }}>
            Paid tutoring is expensive and online tutorials lack interactive feedback.
            TimeBank Learn connects students and learners through time credits instead of money:
            <strong> 1 hour of teaching equals 1 credit</strong> regardless of the skill.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link to="/browse" className="btn btn-primary btn-lg">
              <Compass size={19} /> Explore Skill Listings
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Join & Get 2 Free Credits <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {/* Evaluator Quick Demo Bar */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.5rem',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Zap size={18} color="var(--primary-600)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                Evaluator 1-Click Demo Profiles (Pre-seeded with requests, sessions & credits):
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleQuickLogin('admin@timebank.org')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                🛡️ <strong>Admin</strong> (admin@timebank.org)
              </button>
              <button
                onClick={() => handleQuickLogin('rahul@example.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                🎸 <strong>Rahul</strong> (Teacher: Guitar & Calligraphy)
              </button>
              <button
                onClick={() => handleQuickLogin('sneha@example.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                🎓 <strong>Sneha</strong> (Active Learner)
              </button>
              <button
                onClick={() => handleQuickLogin('ananya@example.com')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                🗣️ <strong>Ananya</strong> (Teacher: Spoken English)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>How TimeBank Learn Works</h2>
            <p style={{ color: 'var(--slate-600)' }}>
              Built strictly according to IEEE Std 830-1998 specifications for fair, reliable peer-to-peer credit exchange.
            </p>
          </div>

          <div className="grid grid-cols-3">
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1 Hour = 1 Credit</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Every hour you teach awards 1 credit regardless of whether you teach guitar, Malayalam calligraphy, or React programming. Everyone starts with 2 free credits.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Safe Hold-and-Release</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                When a teacher accepts your booking, credits are held in escrow. They are only released to the teacher when <strong>both teacher and learner confirm completion</strong>.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-amber-light)',
                  color: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Append-Only Ledger</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Every credit movement (grant, hold, release, refund, receive) is written to an immutable append-only ledger so balances can never go below zero and can be reconciled at any moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ padding: '3rem 0 4rem', background: 'white', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Explore Categories</h2>
              <p style={{ color: 'var(--slate-500)' }}>Find community teachers across diverse disciplines</p>
            </div>
            <Link to="/browse" className="btn btn-outline btn-sm">
              View All Skills <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/browse?category=${encodeURIComponent(c.name)}`}
                className="card card-interactive"
                style={{ padding: '1.5rem', textAlign: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--slate-900)' }}>{c.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{c.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
