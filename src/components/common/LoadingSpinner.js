import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    light: 'text-light',
    dark: 'text-dark'
  };

  const spinnerClasses = `spinner-border ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
        <div className="text-center">
          <div className={spinnerClasses} role="status">
            <span className="visually-hidden">{text}</span>
          </div>
          {text && (
            <div className="mt-3 text-muted">
              {text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <div className="text-center">
        <div className={spinnerClasses} role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        {text && (
          <div className="mt-2 text-muted small">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
