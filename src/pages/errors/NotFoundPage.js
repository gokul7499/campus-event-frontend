import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <div className="py-5">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '5rem' }}></i>
            <h1 className="display-1 fw-bold text-muted">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="text-muted mb-4">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/" variant="primary" size="lg">
                <i className="bi bi-house me-2"></i>
                Go Home
              </Button>
              <Button 
                variant="outline-secondary" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
