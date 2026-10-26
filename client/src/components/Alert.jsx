import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={isError ? 'state-error' : isSuccess ? 'state-success' : 'state-empty'}>
      {isError && <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
      {isSuccess && <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
      {!isError && !isSuccess && <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
      <div style={{ flex: 1, fontSize: '0.9rem' }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
        >
          ×
        </button>
      )}
    </div>
  );
};
