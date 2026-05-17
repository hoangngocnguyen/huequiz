import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC<{ message?: string; timeLeft?: number }> = ({ message = 'Đang tải câu hỏi...', timeLeft }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-message">
        {message}
        {typeof timeLeft === 'number' && (
          <div className="timer">{timeLeft}s</div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
