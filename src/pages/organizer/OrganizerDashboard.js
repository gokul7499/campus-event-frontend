import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Table,
  ListGroup
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    events: [],
    upcomingEvents: [],
    recentRegistrations: [],
    popularEvents: [],
    monthlyTrends: [],
    stats: {
      totalEvents: 0,
      upcomingEvents: 0,
      pastEvents: 0,
      draftEvents: 0,
      publishedEvents: 0,
      totalRegistrations: 0,
      pendingRegistrations: 0,
      confirmedRegistrations: 0,
      totalAttendees: 0
    },
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [creatingData, setCreatingData] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('Fetching organizer dashboard data...');

      // Try to fetch from organizer dashboard API
      try {
        const dashboardRes = await axios.get('/api/dashboard/organizer');
        const data = dashboardRes.data.data;

        console.log('Organizer dashboard API response:', data);

        setDashboardData({
          events: data.events || [],
          upcomingEvents: data.upcomingEvents || [],
          recentRegistrations: data.recentRegistrations || [],
          popularEvents: data.popularEvents || [],
          monthlyTrends: data.monthlyTrends || [],
          stats: data.stats || {
            totalEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
            draftEvents: 0,
            publishedEvents: 0,
            totalRegistrations: 0,
            pendingRegistrations: 0,
            confirmedRegistrations: 0,
            totalAttendees: 0
          },
          notifications: data.notifications || []
        });

        console.log('Organizer dashboard data loaded successfully');
      } catch (dashboardError) {
        console.log('Dashboard API failed:', dashboardError.message);

        // Fallback: try to fetch events directly
        try {
          const eventsRes = await axios.get('/api/events/my/events');
          const events = eventsRes.value?.data?.data || [];

          setDashboardData(prev => ({
            ...prev,
            events: events.slice(0, 10),
            upcomingEvents: events.filter(e => new Date(e.startDate) > new Date()).slice(0, 5),
            stats: {
              ...prev.stats,
              totalEvents: events.length,
              upcomingEvents: events.filter(e => new Date(e.startDate) > new Date()).length,
              publishedEvents: events.filter(e => e.status === 'published').length,
              draftEvents: events.filter(e => e.status === 'draft').length
            }
          }));
        } catch (eventsError) {
          console.log('Events API also failed, using mock data');
          // Mock data is already set in backend
        }
      }

    } catch (error) {
      console.error('Error fetching organizer dashboard data:', error);
    } finally {
      setLoading(false);
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
      pending: { bg: 'warning', text: 'Pending' },
      waitlisted: { bg: 'info', text: 'Waitlisted' },
      cancelled: { bg: 'danger', text: 'Cancelled' },
      attended: { bg: 'primary', text: 'Attended' }
    };

    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createSampleData = async () => {
    try {
      setCreatingData(true);
      const response = await axios.post('/api/dashboard/create-organizer-data');
      if (response.data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
        alert(`Success! Created ${response.data.data.eventsCreated} sample events. Dashboard updated!`);
      }
    } catch (error) {
      console.error('Error creating organizer sample data:', error);
      alert('Failed to create sample data. Please try again.');
    } finally {
      setCreatingData(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading organizer dashboard..." />;
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Welcome back, {user?.firstName || 'Organizer'}!</h1>
              <p className="text-muted mb-0">Manage your events and track registrations</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={fetchDashboardData}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
              {dashboardData.stats.totalEvents === 0 && (
                <Button
                  variant="outline-success"
                  onClick={createSampleData}
                  disabled={creatingData}
                >
                  {creatingData ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Sample Events
                    </>
                  )}
                </Button>
              )}
              <Button variant="primary" as={Link} to="/create-event">
                <i className="bi bi-plus-circle me-2"></i>
                Create Event
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-calendar-event text-primary" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Events</h6>
                  <h3 className="mb-0">{dashboardData.stats.totalEvents}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-clock text-success" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Upcoming Events</h6>
                  <h3 className="mb-0">{dashboardData.stats.upcomingEvents}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-people text-info" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Registrations</h6>
                  <h3 className="mb-0">{dashboardData.stats.totalRegistrations}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Pending Approvals</h6>
                  <h3 className="mb-0">{dashboardData.stats.pendingRegistrations}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Events */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Recent Events</h5>
              <Button variant="outline-primary" size="sm" as={Link} to="/manage-events">
                View All Events
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.events.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Registrations</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.events.slice(0, 5).map(event => (
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
                            <small>{formatDate(event.startDate)}</small>
                          </td>
                          <td>{getStatusBadge(event.status)}</td>
                          <td>
                            <span className="fw-bold">{event.registrationCount || 0}</span>
                            <small className="text-muted">/{event.maxAttendees || 'N/A'}</small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                as={Link}
                                to={`/events/${event._id}`}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                as={Link}
                                to={`/edit-event/${event._id}`}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">No Events Yet</h5>
                  <p className="text-muted">Create your first event to get started!</p>
                  <Button variant="primary" as={Link} to="/create-event">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Event
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Recent Registrations */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h6 className="mb-0">Recent Registrations</h6>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentRegistrations.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recentRegistrations.slice(0, 5).map(registration => (
                    <ListGroup.Item key={registration._id} className="px-0 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 small">{registration.participant?.firstName} {registration.participant?.lastName}</h6>
                          <p className="text-muted mb-1 small">{registration.event?.title}</p>
                          <small className="text-muted">
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          {getRegistrationStatusBadge(registration.status)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted small">No recent registrations</p>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" as={Link} to="/create-event">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Event
                </Button>
                <Button variant="outline-primary" as={Link} to="/manage-events">
                  <i className="bi bi-calendar-check me-2"></i>
                  Manage Events
                </Button>
                <Button variant="outline-success" as={Link} to="/admin/participants">
                  <i className="bi bi-people me-2"></i>
                  View Participants
                </Button>
                <Button variant="outline-info" as={Link} to="/admin/notifications">
                  <i className="bi bi-bell me-2"></i>
                  Send Notifications
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrganizerDashboard;
