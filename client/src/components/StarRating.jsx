import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, count, interactive = false, onRatingChange, size = 16 }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <span
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              color: isFilled ? '#f59e0b' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Star size={size} fill={isFilled ? '#f59e0b' : 'none'} strokeWidth={1.5} />
          </span>
        );
      })}
      {rating > 0 && !interactive && (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', marginLeft: '0.25rem' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
