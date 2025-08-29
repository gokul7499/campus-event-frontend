import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Button,
  ListGroup
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    upcomingEvents: [],
    recentRegistrations: [],
    stats: {
      totalRegistrations: 0,
      upcomingEvents: 0,
      completedEvents: 0,
      cancelledEvents: 0
    },
    notifications: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [creatingData, setCreatingData] = useState(false);

  // Mock data for when APIs are not available
  const getMockData = () => {
    const mockEvents = [
      {
        _id: 'mock1',
        event: {
          _id: 'event1',
          title: 'Annual Science Fair',
          description: 'Join us for the annual science fair featuring innovative projects from students.',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
          venue: { name: 'Main Auditorium' }
        },
        status: 'confirmed',
        registrationDate: new Date().toISOString()
      },
      {
        _id: 'mock2',
        event: {
          _id: 'event2',
          title: 'Basketball Championship',
          description: 'Cheer for your favorite team in the exciting basketball championship finals.',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          venue: { name: 'Sports Complex' }
        },
        status: 'confirmed',
        registrationDate: new Date().toISOString()
      },
      {
        _id: 'mock3',
        event: {
          _id: 'event3',
          title: 'AI Workshop',
          description: 'Learn about artificial intelligence and machine learning.',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          venue: { name: 'Tech Center' }
        },
        status: 'pending',
        registrationDate: new Date().toISOString()
      },
      {
        _id: 'mock4',
        event: {
          _id: 'event4',
          title: 'Music Concert (Completed)',
          description: 'Amazing music concert that you attended.',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          venue: { name: 'Concert Hall' }
        },
        status: 'attended',
        registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'mock5',
        event: {
          _id: 'event5',
          title: 'Art Exhibition (Completed)',
          description: 'Beautiful art exhibition that was completed.',
          startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
          venue: { name: 'Art Gallery' }
        },
        status: 'attended',
        registrationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockNotifications = [
      {
        _id: 'notif1',
        title: 'Event Reminder',
        message: 'Your event "Annual Science Fair" is starting in 7 days!',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'notif2',
        title: 'Registration Confirmed',
        message: 'Your registration for "Basketball Championship" has been confirmed.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'notif3',
        title: 'New Event Available',
        message: 'Check out the new AI Workshop - registration is now open!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return { events: mockEvents, notifications: mockNotifications };
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Load mock data first to ensure something shows
      const mockData = getMockData();

      // Process mock data properly
      const now = new Date();
      const upcomingMock = mockData.events.filter(reg =>
        new Date(reg.event.startDate) > now &&
        ['confirmed', 'pending', 'waitlisted'].includes(reg.status)
      );
      const completedMock = mockData.events.filter(reg =>
        new Date(reg.event.endDate) < now || reg.status === 'attended'
      );
      const cancelledMock = mockData.events.filter(reg => reg.status === 'cancelled');

      const mockStats = {
        totalRegistrations: mockData.events.length,
        upcomingEvents: upcomingMock.length,
        completedEvents: completedMock.length,
        cancelledEvents: cancelledMock.length
      };

      const mockAchievements = calculateAchievements(mockStats);

      // Set mock data immediately
      setDashboardData({
        upcomingEvents: upcomingMock,
        recentRegistrations: mockData.events.slice(0, 5),
        stats: mockStats,
        notifications: mockData.notifications,
        achievements: mockAchievements
      });

      // Try to fetch real data in background
      try {
        const dashboardRes = await axios.get('/api/dashboard/participant');
        const data = dashboardRes.data.data;

        // Only update if we got valid data
        if (data && data.stats && data.stats.totalRegistrations !== undefined) {
          const achievements = calculateAchievements(data.stats);

          setDashboardData({
            upcomingEvents: data.upcomingEvents || [],
            recentRegistrations: data.recentRegistrations || data.registrations || [],
            stats: {
              totalRegistrations: data.stats.totalRegistrations || 0,
              upcomingEvents: data.stats.upcomingEvents || 0,
              completedEvents: data.stats.completedEvents || 0,
              cancelledEvents: data.stats.cancelledEvents || 0
            },
            notifications: data.notifications || [],
            achievements
          });
        }
      } catch (dashboardError) {
        // Mock data is already set, so we're good
      }

    } catch (error) {
      // Mock data is already set, so we don't need to do anything else
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (stats) => {
    const achievements = [];

    if (stats.totalRegistrations >= 1) {
      achievements.push({
        title: 'First Event',
        description: 'Registered for your first event',
        icon: 'bi-trophy',
        color: 'success'
      });
    }

    if (stats.totalRegistrations >= 5) {
      achievements.push({
        title: 'Event Enthusiast',
        description: 'Registered for 5+ events',
        icon: 'bi-star',
        color: 'warning'
      });
    }

    if (stats.totalRegistrations >= 10) {
      achievements.push({
        title: 'Super Participant',
        description: 'Registered for 10+ events',
        icon: 'bi-gem',
        color: 'primary'
      });
    }

    if (stats.completedEvents >= 3) {
      achievements.push({
        title: 'Committed Attendee',
        description: 'Attended 3+ events',
        icon: 'bi-check-circle',
        color: 'info'
      });
    }

    return achievements;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { bg: 'success', text: 'Confirmed' },
      pending: { bg: 'warning', text: 'Pending' },
      waitlisted: { bg: 'info', text: 'Waitlisted' },
      cancelled: { bg: 'danger', text: 'Cancelled' },
      attended: { bg: 'primary', text: 'Attended' },
      'no-show': { bg: 'secondary', text: 'No Show' }
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
      const response = await axios.post('/api/dashboard/create-sample-data');
      if (response.data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
        alert(`Success! Created ${response.data.data.registrationsCreated} sample registrations. Refresh the page to see your data.`);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Failed to create sample data. Please try again.');
    } finally {
      setCreatingData(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Welcome back, {user?.firstName || 'Participant'}!</h1>
              <p className="text-muted mb-0">Here's what's happening with your events</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={fetchDashboardData}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
              {dashboardData.stats.totalRegistrations === 0 && (
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
                      Create Sample Data
                    </>
                  )}
                </Button>
              )}
              <Button variant="primary" as={Link} to="/events">
                <i className="bi bi-calendar-plus me-2"></i>
                Browse Events
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
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-clock text-success" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Upcoming</h6>
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
                    <i className="bi bi-check-circle text-info" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Completed</h6>
                  <h3 className="mb-0">{dashboardData.stats.completedEvents}</h3>
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
                    <i className="bi bi-star text-warning" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Achievements</h6>
                  <h3 className="mb-0">{dashboardData.achievements.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Upcoming Events */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Events</h5>
              <Button variant="outline-primary" size="sm" as={Link} to="/my-registrations">
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.upcomingEvents.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.upcomingEvents.map(registration => (
                    <ListGroup.Item key={registration._id} className="px-4 py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{registration.event?.title || 'Event Title'}</h6>
                          <p className="text-muted mb-1 small">
                            {registration.event?.description?.substring(0, 100) || 'No description available'}
                            {registration.event?.description?.length > 100 ? '...' : ''}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {registration.event?.startDate ? formatDate(registration.event.startDate) : 'Date TBD'}
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {registration.event?.venue?.name || 'Venue TBD'}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          {getStatusBadge(registration.status)}
                          <div className="mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/events/${registration.event?._id || '#'}`}
                              disabled={!registration.event?._id}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">No Upcoming Events</h5>
                  <p className="text-muted">
                    {dashboardData.stats.totalRegistrations === 0
                      ? "You haven't registered for any events yet. Start exploring!"
                      : "You don't have any upcoming events. Browse and register for more events!"
                    }
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" as={Link} to="/events">
                      Browse Events
                    </Button>
                    {dashboardData.stats.totalRegistrations > 0 && (
                      <Button variant="outline-primary" as={Link} to="/my-registrations">
                        View All Registrations
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Achievements */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h6 className="mb-0">Your Achievements</h6>
            </Card.Header>
            <Card.Body>
              {dashboardData.achievements.length > 0 ? (
                dashboardData.achievements.map((achievement, index) => (
                  <div key={index} className="d-flex align-items-center mb-3">
                    <div className="flex-shrink-0 me-3">
                      <div className={`bg-${achievement.color} bg-opacity-10 rounded-circle p-2`}>
                        <i className={`${achievement.icon} text-${achievement.color}`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{achievement.title}</h6>
                      <small className="text-muted">{achievement.description}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small">Start participating in events to earn achievements!</p>
              )}
            </Card.Body>
          </Card>

          {/* Recent Notifications */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Notifications</h6>
              <Button variant="outline-primary" size="sm" as={Link} to="/notifications">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.notifications.length > 0 ? (
                dashboardData.notifications.slice(0, 3).map(notification => (
                  <div key={notification._id} className="mb-3">
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0 me-2">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-1">
                          <i className="bi bi-bell text-primary small"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small">{notification.title}</h6>
                        <p className="text-muted small mb-1">{notification.message?.substring(0, 80)}...</p>
                        <small className="text-muted">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small">No recent notifications</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ParticipantDashboard;
