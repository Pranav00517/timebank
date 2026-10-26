import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="state-loading">
      <div className="spinner"></div>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', fontWeight: 500 }}>{text}</p>
    </div>
  );
};
