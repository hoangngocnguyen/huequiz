import React from 'react';
import './LoadingSpinner.css';
import { useTranslation } from './hooks/useTranslation';

const LoadingSpinner: React.FC<{ message?: string; timeLeft?: number }> = ({ message, timeLeft }) => {
  const t = useTranslation();
  const loadingMessage = message || t.loading.questions;

  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-message">
        {loadingMessage}
        {typeof timeLeft === 'number' && (
          <div className="timer">{timeLeft}s</div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
