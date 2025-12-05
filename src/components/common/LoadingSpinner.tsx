import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  overlay = false
}) => {
  const spinner = (
    <div className={`loading-spinner ${size} ${color}`}>
      <div className="spinner-circle">
        <div className="spinner-sector"></div>
        <div className="spinner-sector"></div>
        <div className="spinner-sector"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;