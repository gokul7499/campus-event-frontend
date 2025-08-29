import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {},
    events: {},
    registrations: {},
    categories: {},
    notifications: {}
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all statistics in parallel
      const [
        userStatsRes,
        eventStatsRes,
        registrationStatsRes,
        categoryStatsRes,
        notificationStatsRes,
        recentUsersRes,
        recentEventsRes
      ] = await Promise.allSettled([
        axios.get('/api/users/stats'),
        axios.get('/api/events/admin/stats'),
        axios.get('/api/registrations/admin/stats'),
        axios.get('/api/categories/admin/stats'),
        axios.get('/api/notifications/admin/stats'),
        axios.get('/api/users?limit=5&sortBy=createdAt&sortOrder=desc'),
        axios.get('/api/events?limit=5&sortBy=createdAt&sortOrder=desc')
      ]);

      // Process results
      if (userStatsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, users: userStatsRes.value.data.data }));
      }
      if (eventStatsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, events: eventStatsRes.value.data.data }));
      }
      if (registrationStatsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, registrations: registrationStatsRes.value.data.data }));
      }
      if (categoryStatsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, categories: categoryStatsRes.value.data.data }));
      }
      if (notificationStatsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, notifications: notificationStatsRes.value.data.data }));
      }
      if (recentUsersRes.status === 'fulfilled') {
        setRecentUsers(recentUsersRes.value.data.data || []);
      }
      if (recentEventsRes.status === 'fulfilled') {
        setRecentEvents(recentEventsRes.value.data.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AdminLayout>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>
              <p className="text-muted mb-0">Welcome back, {user?.firstName}! Here's what's happening.</p>
            </div>
            <Button
              variant="outline-primary"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : <i className="bi bi-arrow-clockwise me-2"></i>}
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Users</h6>
                  <h3 className="mb-0">{stats.users.totalUsers || 0}</h3>
                  <small className="text-success">
                    <i className="bi bi-arrow-up"></i> {stats.users.newUsersThisMonth || 0} this month
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-calendar-event text-success" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Events</h6>
                  <h3 className="mb-0">{stats.events.totalEvents || 0}</h3>
                  <small className="text-info">
                    <i className="bi bi-clock"></i> {stats.events.upcomingEvents || 0} upcoming
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-person-check text-warning" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Registrations</h6>
                  <h3 className="mb-0">{stats.registrations.totalRegistrations || 0}</h3>
                  <small className="text-muted">All time</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-folder text-info" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Categories</h6>
                  <h3 className="mb-0">{stats.categories.totalCategories || 0}</h3>
                  <small className="text-muted">Active</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col lg={3} md={6} className="mb-3">
                  <div className="d-grid">
                    <Button as={Link} to="/admin/users" variant="outline-primary" size="lg">
                      <i className="bi bi-people me-2"></i>
                      Manage Users
                    </Button>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="d-grid">
                    <Button as={Link} to="/manage-events" variant="outline-success" size="lg">
                      <i className="bi bi-calendar-event me-2"></i>
                      Manage Events
                    </Button>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="d-grid">
                    <Button as={Link} to="/manage-categories" variant="outline-warning" size="lg">
                      <i className="bi bi-folder me-2"></i>
                      Manage Categories
                    </Button>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div className="d-grid">
                    <Button as={Link} to="/admin/analytics" variant="outline-info" size="lg">
                      <i className="bi bi-graph-up me-2"></i>
                      View Analytics
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Users</h5>
              <Button as={Link} to="/admin/users" variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {recentUsers.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <span className="text-primary fw-bold">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-0">{user.firstName} {user.lastName}</h6>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'organizer' ? 'warning' : 'info'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>{user.department || 'N/A'}</td>
                        <td>
                          <small className="text-muted">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-people text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No recent users</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Events</h5>
              <Button as={Link} to="/manage-events" variant="outline-success" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {recentEvents.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Registrations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map(event => (
                      <tr key={event._id}>
                        <td>
                          <div>
                            <h6 className="mb-0">{event.title}</h6>
                            <small className="text-muted">{event.venue?.name}</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={
                            event.status === 'published' ? 'success' :
                            event.status === 'draft' ? 'warning' :
                            event.status === 'cancelled' ? 'danger' : 'secondary'
                          }>
                            {event.status}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(event.startDate).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <span className="fw-bold">{event.registrationCount || 0}</span>
                          <small className="text-muted">/{event.capacity}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-event text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No recent events</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Role Distribution */}
      {stats.users.roleStats && stats.users.roleStats.length > 0 && (
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">User Role Distribution</h5>
              </Card.Header>
              <Card.Body>
                {stats.users.roleStats.map(role => (
                  <div key={role._id} className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <Badge bg={
                        role._id === 'admin' ? 'danger' :
                        role._id === 'organizer' ? 'warning' : 'info'
                      } className="me-3">
                        {role._id}
                      </Badge>
                      <span className="text-capitalize">{role._id}s</span>
                    </div>
                    <span className="fw-bold">{role.count}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0">Top Departments</h5>
              </Card.Header>
              <Card.Body>
                {stats.users.departmentStats && stats.users.departmentStats.length > 0 ? (
                  stats.users.departmentStats.slice(0, 5).map(dept => (
                    <div key={dept._id} className="d-flex justify-content-between align-items-center mb-3">
                      <span>{dept._id}</span>
                      <span className="fw-bold">{dept.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3">
                    <p className="text-muted mb-0">No department data available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
