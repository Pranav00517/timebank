import React from 'react';
import { Clock, Heart, Award, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-color)', marginTop: '4rem', padding: '3rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div className="brand-icon" style={{ width: '1.75rem', height: '1.75rem' }}>
                <Clock size={16} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>
                TimeBank <span style={{ color: 'var(--primary-600)' }}>Learn</span>
              </span>
            </div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              A peer-to-peer skill exchange platform where time is the currency. Teach 1 hour, earn 1 credit, spend it learning something new.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-400)', marginBottom: '0.75rem' }}>
              Academic Reference
            </h4>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
              <strong>Course:</strong> Full Stack Application Development
            </p>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
              <strong>Curriculum:</strong> ICT Academy of Kerala
            </p>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
              <strong>College:</strong> Sahrdaya College of Engineering & Technology
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-400)', marginBottom: '0.75rem' }}>
              Standard & Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
              <span>• IEEE Std 830-1998 Compliant Specification</span>
              <span>• MERN Stack (MongoDB, Express, React, Node.js)</span>
              <span>• Append-Only Escrow Credit Ledger Model</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.825rem', color: 'var(--slate-500)' }}>
          <p>© {new Date().getFullYear()} TimeBank Learn. Prepared by Pranav Krishna PB.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with React & Node.js REST API
          </p>
        </div>
      </div>
    </footer>
  );
};
