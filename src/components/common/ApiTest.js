import React, { useState } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import axios from '../../utils/axios';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.get(endpoint);
      setResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>API Test Component</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex gap-2 mb-3">
          <Button 
            variant="primary" 
            onClick={() => testApi('/api/health')}
            disabled={loading}
          >
            Test Health
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => testApi('/api/auth/me')}
            disabled={loading}
          >
            Test Auth
          </Button>
          <Button 
            variant="warning" 
            onClick={() => testApi('/api/users')}
            disabled={loading}
          >
            Test Users
          </Button>
        </div>

        {loading && <Alert variant="info">Testing API...</Alert>}

        {result && (
          <Alert variant={result.success ? 'success' : 'danger'}>
            <strong>Status: {result.status}</strong>
            <pre style={{ marginTop: '10px', fontSize: '12px' }}>
              {JSON.stringify(result.success ? result.data : result.error, null, 2)}
            </pre>
          </Alert>
        )}

        <div className="mt-3">
          <small className="text-muted">
            Current token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ApiTest;
