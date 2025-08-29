import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [registrationToCancel, setRegistrationToCancel] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRegistration, setFeedbackRegistration] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
    wouldRecommend: true,
    categories: {
      content: 5,
      organization: 5,
      venue: 5,
      overall: 5
    }
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/registrations/my');
      setRegistrations(response.data.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationToCancel) return;

    try {
      await axios.delete(`/api/registrations/${registrationToCancel._id}`);
      toast.success('Registration cancelled successfully');
      fetchRegistrations();
      setShowCancelModal(false);
      setRegistrationToCancel(null);
    } catch (error) {
      console.error('Failed to cancel registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`/api/registrations/${feedbackRegistration._id}/feedback`, feedbackData);
      toast.success('Feedback submitted successfully');
      fetchRegistrations();
      setShowFeedbackModal(false);
      setFeedbackRegistration(null);
      setFeedbackData({
        rating: 5,
        comment: '',
        wouldRecommend: true,
        categories: { content: 5, organization: 5, venue: 5, overall: 5 }
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      waitlisted: 'info',
      cancelled: 'danger',
      attended: 'primary',
      'no-show': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const canCancelRegistration = (registration) => {
    const event = registration.event;
    const now = new Date();
    const eventStart = new Date(event.startDate);
    
    return registration.status === 'confirmed' && eventStart > now;
  };

  const filterRegistrations = (status) => {
    if (status === 'upcoming') {
      return registrations.filter(reg => 
        !isEventPast(reg.event.endDate) && 
        ['confirmed', 'pending', 'waitlisted'].includes(reg.status)
      );
    } else if (status === 'past') {
      return registrations.filter(reg => 
        isEventPast(reg.event.endDate) || 
        ['attended', 'no-show', 'cancelled'].includes(reg.status)
      );
    }
    return registrations;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const upcomingRegistrations = filterRegistrations('upcoming');
  const pastRegistrations = filterRegistrations('past');

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">My Event Registrations</h1>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="upcoming" title={`Upcoming (${upcomingRegistrations.length})`}>
                  {upcomingRegistrations.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-calendar-check text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3">No Upcoming Events</h4>
                      <p className="text-muted">You haven't registered for any upcoming events.</p>
                      <Link to="/events" className="btn btn-primary">
                        Browse Events
                      </Link>
                    </div>
                  ) : (
                    <Row>
                      {upcomingRegistrations.map(registration => (
                        <Col md={6} lg={4} key={registration._id} className="mb-4">
                          <Card className="h-100">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title">{registration.event.title}</h6>
                                {getStatusBadge(registration.status)}
                              </div>
                              
                              <p className="text-muted small mb-2">
                                <i className="bi bi-geo-alt me-1"></i>
                                {registration.event.venue?.name || 'Venue TBA'}
                              </p>
                              
                              <p className="text-muted small mb-2">
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(registration.event.startDate)}
                              </p>
                              
                              <p className="text-muted small mb-3">
                                <i className="bi bi-clock me-1"></i>
                                Registered: {formatDate(registration.registrationDate)}
                              </p>

                              {registration.registrationNumber && (
                                <p className="text-muted small mb-3">
                                  <i className="bi bi-hash me-1"></i>
                                  {registration.registrationNumber}
                                </p>
                              )}

                              <div className="d-flex gap-2">
                                <Button
                                  as={Link}
                                  to={`/events/${registration.event._id}`}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  View Event
                                </Button>
                                
                                {canCancelRegistration(registration) && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      setRegistrationToCancel(registration);
                                      setShowCancelModal(true);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab>

                <Tab eventKey="past" title={`Past (${pastRegistrations.length})`}>
                  {pastRegistrations.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3">No Past Events</h4>
                      <p className="text-muted">You haven't attended any events yet.</p>
                    </div>
                  ) : (
                    <Row>
                      {pastRegistrations.map(registration => (
                        <Col md={6} lg={4} key={registration._id} className="mb-4">
                          <Card className="h-100">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title">{registration.event.title}</h6>
                                {getStatusBadge(registration.status)}
                              </div>
                              
                              <p className="text-muted small mb-2">
                                <i className="bi bi-geo-alt me-1"></i>
                                {registration.event.venue?.name || 'Venue TBA'}
                              </p>
                              
                              <p className="text-muted small mb-2">
                                <i className="bi bi-calendar me-1"></i>
                                {formatDate(registration.event.startDate)}
                              </p>

                              {registration.feedback?.rating && (
                                <div className="mb-2">
                                  <small className="text-muted">Your Rating: </small>
                                  <span className="text-warning">
                                    {'★'.repeat(registration.feedback.rating)}
                                    {'☆'.repeat(5 - registration.feedback.rating)}
                                  </span>
                                </div>
                              )}

                              <div className="d-flex gap-2">
                                <Button
                                  as={Link}
                                  to={`/events/${registration.event._id}`}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  View Event
                                </Button>
                                
                                {registration.status === 'attended' && !registration.feedback?.rating && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => {
                                      setFeedbackRegistration(registration);
                                      setShowFeedbackModal(true);
                                    }}
                                  >
                                    Leave Feedback
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Registration Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel your registration for "{registrationToCancel?.event.title}"?</p>
          <p className="text-warning">
            <strong>Note:</strong> Depending on the event's cancellation policy, you may or may not receive a refund.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Registration
          </Button>
          <Button variant="danger" onClick={handleCancelRegistration}>
            Cancel Registration
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Event Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="mb-3">{feedbackRegistration?.event.title}</h6>
          <Form onSubmit={handleSubmitFeedback}>
            <Form.Group className="mb-3">
              <Form.Label>Overall Rating</Form.Label>
              <Form.Select
                value={feedbackData.rating}
                onChange={(e) => setFeedbackData({ ...feedbackData, rating: parseInt(e.target.value) })}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Share your thoughts about the event..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="would-recommend"
                label="I would recommend this event to others"
                checked={feedbackData.wouldRecommend}
                onChange={(e) => setFeedbackData({ ...feedbackData, wouldRecommend: e.target.checked })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Feedback
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MyRegistrationsPage;
