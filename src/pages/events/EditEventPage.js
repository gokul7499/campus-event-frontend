import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const EditEventPage = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <i className="bi bi-calendar-event text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="mt-3">Edit Event</h4>
              <p className="text-muted">
                This page will allow organizers to edit their events.
              </p>
              <p className="text-muted small">
                Feature coming soon...
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditEventPage;
