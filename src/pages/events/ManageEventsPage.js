import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageEventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    // Only fetch events if user is loaded
    if (user) {
      fetchEvents();
    }
  }, [filters, user]);

  const fetchEvents = async () => {
    if (!user) {
      console.log('User not loaded yet, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      console.log('=== FETCHING EVENTS ===');
      console.log('User role:', user.role);
      console.log('Filters:', filters);
      console.log('Params:', params.toString());

      let endpoint;
      if (user.role === 'admin') {
        // Admin can see all events
        endpoint = '/api/events';
      } else {
        // Organizers see only their events
        endpoint = '/api/events/my/events';
      }

      console.log('Using endpoint:', endpoint);
      const response = await axios.get(`${endpoint}?${params}`);

      console.log('=== API RESPONSE ===');
      console.log('Full response:', response.data);
      console.log('Response structure:', Object.keys(response.data));

      // Handle different response structures
      let eventsData = [];
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          // Direct array (from /api/events)
          eventsData = response.data.data;
        } else if (response.data.data.events) {
          // Nested events array (from /api/events/my/events)
          eventsData = response.data.data.events;
        } else if (response.data.data.data) {
          // Double nested (pagination response)
          eventsData = response.data.data.data;
        }
      }

      console.log('Events extracted:', eventsData);
      console.log('Events count:', eventsData.length);

      setEvents(eventsData);
    } catch (error) {
      console.error('=== ERROR FETCHING EVENTS ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // If it's a 404 or network error, provide mock data for demo
      if (error.response?.status === 404 || !error.response) {
        console.log('Providing mock data for demo...');
        const mockEvents = [
          {
            _id: 'mock1',
            title: 'Sample Tech Conference',
            description: 'A sample technology conference for demonstration',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
            status: 'published',
            venue: { name: 'Convention Center' },
            capacity: 500,
            registrationCount: 25,
            waitlistCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            _id: 'mock2',
            title: 'Workshop: Digital Marketing',
            description: 'Learn digital marketing strategies',
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            status: 'draft',
            venue: { name: 'Training Room A' },
            capacity: 50,
            registrationCount: 0,
            waitlistCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setEvents(mockEvents);
        toast.info('Using demo data (backend not available)');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load events');
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await axios.delete(`/api/events/${eventToDelete._id}`);
      toast.success('Event deleted successfully');
      setEvents(events.filter(event => event._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await axios.put(`/api/events/${eventId}`, { status: newStatus });
      toast.success('Event status updated');
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      published: 'success',
      cancelled: 'danger',
      completed: 'info'
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Manage Events</h1>
            <Link to="/create-event" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Create New Event
            </Link>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Events</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="createdAt">Created Date</option>
              <option value="startDate">Start Date</option>
              <option value="title">Title</option>
              <option value="registrationCount">Registrations</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Order</Form.Label>
            <Form.Select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Events Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {events.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No Events Found</h4>
                  <p className="text-muted">
                    {filters.search || filters.status !== 'all' 
                      ? 'No events match your current filters.' 
                      : 'You haven\'t created any events yet.'
                    }
                  </p>
                  <Link to="/create-event" className="btn btn-primary">
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Registrations</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{event.title}</h6>
                            <small className="text-muted">
                              {event.venue?.name || 'No venue specified'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{formatDate(event.startDate)}</div>
                            <small className="text-muted">
                              to {formatDate(event.endDate)}
                            </small>
                          </div>
                        </td>
                        <td>{getStatusBadge(event.status)}</td>
                        <td>
                          <div>
                            <strong>{event.registrationCount || 0}</strong> / {event.capacity}
                            {event.waitlistCount > 0 && (
                              <div>
                                <small className="text-muted">
                                  +{event.waitlistCount} waitlisted
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item as={Link} to={`/events/${event._id}`}>
                                <i className="bi bi-eye me-2"></i>View
                              </Dropdown.Item>
                              <Dropdown.Item as={Link} to={`/edit-event/${event._id}`}>
                                <i className="bi bi-pencil me-2"></i>Edit
                              </Dropdown.Item>
                              <Dropdown.Item as={Link} to={`/events/${event._id}/registrations`}>
                                <i className="bi bi-people me-2"></i>Registrations
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              {event.status === 'draft' && (
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(event._id, 'published')}
                                >
                                  <i className="bi bi-check-circle me-2"></i>Publish
                                </Dropdown.Item>
                              )}
                              {event.status === 'published' && (
                                <Dropdown.Item 
                                  onClick={() => handleStatusChange(event._id, 'cancelled')}
                                >
                                  <i className="bi bi-x-circle me-2"></i>Cancel
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-danger"
                                onClick={() => {
                                  setEventToDelete(event);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="bi bi-trash me-2"></i>Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the event "{eventToDelete?.title}"?</p>
          <p className="text-danger">
            <strong>This action cannot be undone.</strong> All registrations and related data will be permanently deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent}>
            Delete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageEventsPage;
