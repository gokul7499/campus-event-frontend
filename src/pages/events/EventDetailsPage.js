import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Alert,
  Modal, Form, Spinner
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatAddress } from '../../utils/addressUtils';
import '../../styles/EventDetailsPage.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    additionalInfo: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    dietaryRestrictions: [],
    specialRequirements: ''
  });
  const [userRegistration, setUserRegistration] = useState(null);
  const [error, setError] = useState('');

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data.data);

    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Failed to load event details. Please try again.');

      // If event not found, show mock data for demo
      if (error.response?.status === 404) {
        setEvent({
          _id: id,
          title: 'Sample Event',
          description: 'This is a sample event for demonstration purposes. The actual event data could not be loaded.',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          venue: {
            name: 'Sample Venue',
            address: '123 Sample Street, Sample City',
            capacity: 100
          },
          category: {
            name: 'Sample Category',
            color: '#007bff'
          },
          organizer: {
            firstName: 'Sample',
            lastName: 'Organizer',
            email: 'organizer@example.com'
          },
          maxAttendees: 100,
          registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'published',
          isPublic: true,
          tags: ['sample', 'demo'],
          requirements: ['Sample requirement'],
          agenda: [
            {
              time: '10:00',
              title: 'Opening Session',
              description: 'Welcome and introduction'
            },
            {
              time: '11:00',
              title: 'Main Presentation',
              description: 'Core content presentation'
            }
          ],
          registrationCount: 25,
          waitlistCount: 0
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkUserRegistration = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      const response = await axios.get(`/api/registrations/check/${id}`);
      setUserRegistration(response.data.data);
    } catch (error) {
      console.error('Error checking user registration:', error);
      setUserRegistration(null);
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      if (user) {
        checkUserRegistration();
      }
    }
  }, [id, user, fetchEventDetails, checkUserRegistration]);

  const handleRegistration = async () => {
    if (!user) {
      showToast('Please login to register for events', 'warning');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);

      const response = await axios.post('/api/registrations', {
        eventId: id,
        ...registrationData
      });

      if (response.data.success) {
        showToast('Registration successful!', 'success');
        setShowRegistrationModal(false);
        setUserRegistration(response.data.data.registration);

        // Refresh event details to update registration count
        fetchEventDetails();
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!userRegistration) return;

    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    try {
      setRegistering(true);

      await axios.delete(`/api/registrations/${userRegistration._id}`);

      showToast('Successfully unregistered from event', 'success');
      setUserRegistration(null);

      // Refresh event details
      fetchEventDetails();
    } catch (error) {
      console.error('Unregistration error:', error);
      showToast('Failed to unregister. Please try again.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      published: { bg: 'success', text: 'Published' },
      draft: { bg: 'secondary', text: 'Draft' },
      cancelled: { bg: 'danger', text: 'Cancelled' },
      completed: { bg: 'info', text: 'Completed' }
    };

    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getRegistrationStatusBadge = (status) => {
    const statusMap = {
      confirmed: { bg: 'success', text: 'Confirmed' },
      pending: { bg: 'warning', text: 'Pending Approval' },
      waitlisted: { bg: 'info', text: 'Waitlisted' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };

    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRegister = () => {
    if (!event || !user) return false;
    if (userRegistration) return false;
    if (event.status !== 'published') return false;
    if (new Date(event.registrationDeadline) < new Date()) return false;
    return true;
  };

  const isEventFull = () => {
    return event && event.registrationCount >= event.maxAttendees;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading event details..." />;
  }

  if (error && !event) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Event</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchEventDetails}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Event Not Found</Alert.Heading>
          <p>The event you're looking for could not be found.</p>
          <Button variant="outline-primary" as={Link} to="/events">
            Browse Events
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-4">
        {/* Navigation */}
        <Row className="mb-3">
          <Col>
            <Button
              variant="link"
              className="p-0 text-decoration-none text-muted"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Events
            </Button>
          </Col>
        </Row>

        {/* Hero Section */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm overflow-hidden">
              {event.imageUrl && (
                <div
                  className="position-relative"
                  style={{
                    height: '300px',
                    background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${event.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="position-absolute bottom-0 start-0 p-4 text-white">
                    <div className="d-flex gap-2 mb-3">
                      {getStatusBadge(event.status)}
                      {event.category && (
                        <Badge
                          style={{
                            backgroundColor: event.category.color,
                            border: 'none'
                          }}
                        >
                          {event.category.name}
                        </Badge>
                      )}
                      {event.isFeatured && <Badge bg="warning">Featured</Badge>}
                    </div>
                    <h1 className="display-5 fw-bold mb-2">{event.title}</h1>
                    <div className="d-flex align-items-center text-white-50">
                      <i className="bi bi-calendar-event me-2"></i>
                      <span>{formatDate(event.startDate)}</span>
                      <span className="mx-3">•</span>
                      <i className="bi bi-geo-alt me-2"></i>
                      <span>{event.venue.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {!event.imageUrl && (
                <Card.Body className="py-5 text-center" style={{ backgroundColor: '#e9ecef' }}>
                  <div className="d-flex gap-2 justify-content-center mb-3">
                    {getStatusBadge(event.status)}
                    {event.category && (
                      <Badge
                        style={{
                          backgroundColor: event.category.color,
                          border: 'none'
                        }}
                      >
                        {event.category.name}
                      </Badge>
                    )}
                    {event.isFeatured && <Badge bg="warning">Featured</Badge>}
                  </div>
                  <h1 className="display-5 fw-bold mb-3 text-dark">{event.title}</h1>
                  <div className="d-flex align-items-center justify-content-center text-muted">
                    <i className="bi bi-calendar-event me-2"></i>
                    <span>{formatDate(event.startDate)}</span>
                    <span className="mx-3">•</span>
                    <i className="bi bi-geo-alt me-2"></i>
                    <span>{event.venue.name}</span>
                  </div>
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>

        {/* Registration Status & Action */}
        {userRegistration && (
          <Row className="mb-4">
            <Col>
              <Alert variant="success" className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>You're registered for this event!</strong>
                  <span className="ms-2">{getRegistrationStatusBadge(userRegistration.status)}</span>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleUnregister}
                  disabled={registering}
                >
                  {registering ? <Spinner size="sm" /> : 'Unregister'}
                </Button>
              </Alert>
            </Col>
          </Row>
        )}

        {!userRegistration && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-4">
                  <div className="mb-3">
                    <h5 className="mb-2">Ready to join this event?</h5>
                    <p className="text-muted mb-0">
                      {isEventFull()
                        ? 'This event is currently full, but you can join the waitlist.'
                        : `${event.maxAttendees - (event.registrationCount || 0)} spots remaining`
                      }
                    </p>
                  </div>
                  {canRegister() ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5"
                      onClick={() => setShowRegistrationModal(true)}
                      disabled={isEventFull()}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      {isEventFull() ? 'Join Waitlist' : 'Register Now'}
                    </Button>
                  ) : !user ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5"
                      as={Link}
                      to="/login"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login to Register
                    </Button>
                  ) : (
                    <Button variant="secondary" size="lg" disabled>
                      <i className="bi bi-x-circle me-2"></i>
                      Registration Closed
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Content Layout */}
        <Row>
          <Col lg={8}>
            {/* Description */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary rounded-circle p-2 me-3">
                    <i className="bi bi-info-circle text-white"></i>
                  </div>
                  <h4 className="mb-0 fw-bold">About This Event</h4>
                </div>
                <p className="text-muted lh-lg mb-0" style={{ fontSize: '1.1rem' }}>
                  {event.description}
                </p>
              </Card.Body>
            </Card>

            {/* Event Details Grid */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success rounded-circle p-2 me-3">
                        <i className="bi bi-calendar-event text-white"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Date & Time</h5>
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-calendar3 me-2 text-muted"></i>
                      <span className="fw-medium">{formatDate(event.startDate)}</span>
                    </div>
                    <div>
                      <i className="bi bi-clock me-2 text-muted"></i>
                      <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info rounded-circle p-2 me-3">
                        <i className="bi bi-geo-alt text-white"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Location</h5>
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-building me-2 text-muted"></i>
                      <span className="fw-medium">{event.venue.name}</span>
                    </div>
                    {event.venue.address && (
                      <div>
                        <i className="bi bi-map me-2 text-muted"></i>
                        <span className="text-muted">{formatAddress(event.venue.address)}</span>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-warning rounded-circle p-2 me-3">
                      <i className="bi bi-list-ul text-white"></i>
                    </div>
                    <h4 className="mb-0 fw-bold">Event Agenda</h4>
                  </div>
                  <div className="timeline">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="timeline-item d-flex mb-4">
                        <div className="timeline-marker me-4">
                          <div className="bg-primary text-white rounded-pill px-3 py-2 fw-bold">
                            {item.time}
                          </div>
                        </div>
                        <div className="timeline-content flex-grow-1">
                          <h6 className="fw-bold mb-2">{item.title}</h6>
                          <p className="text-muted mb-0">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-danger rounded-circle p-2 me-3">
                      <i className="bi bi-exclamation-triangle text-white"></i>
                    </div>
                    <h4 className="mb-0 fw-bold">Requirements</h4>
                  </div>
                  <div className="requirements-list">
                    {event.requirements.map((req, index) => (
                      <div key={index} className="d-flex align-items-start mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Event Stats</h5>

                {/* Registration Progress */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Registration</span>
                    <span className="text-muted">
                      {event.registrationCount || 0} / {event.maxAttendees}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{
                        width: `${Math.min(((event.registrationCount || 0) / event.maxAttendees) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  {event.waitlistCount > 0 && (
                    <small className="text-muted">
                      {event.waitlistCount} on waitlist
                    </small>
                  )}
                </div>

                {/* Registration Deadline */}
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock-history text-warning me-2"></i>
                    <div>
                      <div className="fw-medium">Registration Deadline</div>
                      <small className="text-muted">
                        {formatDate(event.registrationDeadline)}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                {event.organizer && (
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="bg-primary rounded-circle p-2 me-3">
                      <i className="bi bi-person text-white"></i>
                    </div>
                    <div>
                      <div className="fw-medium">Organized by</div>
                      <div className="text-muted">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Tags</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        className="px-3 py-2 rounded-pill"
                        style={{ fontSize: '0.85rem' }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Share */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Share This Event</h5>
                <div className="d-grid gap-3">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center justify-content-center py-2"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Link copied to clipboard!', 'success');
                    }}
                  >
                    <i className="bi bi-link-45deg me-2"></i>
                    Copy Event Link
                  </Button>
                  <Button
                    variant="outline-info"
                    className="d-flex align-items-center justify-content-center py-2"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${event.title}`)}&url=${encodeURIComponent(window.location.href)}`)}
                  >
                    <i className="bi bi-twitter me-2"></i>
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline-success"
                    className="d-flex align-items-center justify-content-center py-2"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.title} ${window.location.href}`)}`)}
                  >
                    <i className="bi bi-whatsapp me-2"></i>
                    Share on WhatsApp
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Registration Modal */}
        <Modal show={showRegistrationModal} onHide={() => setShowRegistrationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register for {event.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Additional Information (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={registrationData.additionalInfo}
                onChange={(e) => setRegistrationData(prev => ({
                  ...prev,
                  additionalInfo: e.target.value
                }))}
                placeholder="Any additional information you'd like to share..."
              />
            </Form.Group>

            <h6>Emergency Contact</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={registrationData.emergencyContact.name}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        name: e.target.value
                      }
                    }))}
                    placeholder="Emergency contact name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={registrationData.emergencyContact.phone}
                    onChange={(e) => setRegistrationData(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="Emergency contact phone"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Relationship</Form.Label>
              <Form.Control
                type="text"
                value={registrationData.emergencyContact.relationship}
                onChange={(e) => setRegistrationData(prev => ({
                  ...prev,
                  emergencyContact: {
                    ...prev.emergencyContact,
                    relationship: e.target.value
                  }
                }))}
                placeholder="Relationship to emergency contact"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Special Requirements (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={registrationData.specialRequirements}
                onChange={(e) => setRegistrationData(prev => ({
                  ...prev,
                  specialRequirements: e.target.value
                }))}
                placeholder="Any special requirements or accommodations needed..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegistrationModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRegistration}
            disabled={registering}
          >
            {registering ? (
              <>
                <Spinner size="sm" className="me-2" />
                Registering...
              </>
            ) : (
              'Complete Registration'
            )}
          </Button>
        </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default EventDetailsPage;
