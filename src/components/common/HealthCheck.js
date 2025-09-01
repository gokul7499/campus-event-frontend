import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    try {
      setHealthStatus('checking');
      const response = await axios.get('/api/health');
      
      if (response.status === 200) {
        setHealthStatus('healthy');
        setLastChecked(new Date().toLocaleTimeString());
      } else {
        setHealthStatus('unhealthy');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('unhealthy');
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-success';
      case 'unhealthy': return 'text-danger';
      case 'checking': return 'text-warning';
      default: return 'text-muted';
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return '✅';
      case 'unhealthy': return '❌';
      case 'checking': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="health-check d-flex align-items-center">
      <span className={`me-2 ${getStatusColor()}`}>
        {getStatusIcon()} Backend: {healthStatus}
      </span>
      {lastChecked && (
        <small className="text-muted">
          (Last checked: {lastChecked})
        </small>
      )}
      <button 
        className="btn btn-sm btn-outline-secondary ms-2"
        onClick={checkHealth}
        disabled={healthStatus === 'checking'}
      >
        Refresh
      </button>
    </div>
  );
};

export default HealthCheck;
