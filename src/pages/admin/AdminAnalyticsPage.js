import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    users: {},
    events: {},
    registrations: {},
    categories: {},
    notifications: {}
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [
        userStatsRes,
        eventStatsRes,
        registrationStatsRes,
        categoryStatsRes,
        notificationStatsRes
      ] = await Promise.allSettled([
        axios.get('/api/users/stats'),
        axios.get('/api/events/admin/stats'),
        axios.get('/api/registrations/admin/stats'),
        axios.get('/api/categories/admin/stats'),
        axios.get('/api/notifications/admin/stats')
      ]);

      if (userStatsRes.status === 'fulfilled') {
        setAnalytics(prev => ({ ...prev, users: userStatsRes.value.data.data }));
      }
      if (eventStatsRes.status === 'fulfilled') {
        setAnalytics(prev => ({ ...prev, events: eventStatsRes.value.data.data }));
      }
      if (registrationStatsRes.status === 'fulfilled') {
        setAnalytics(prev => ({ ...prev, registrations: registrationStatsRes.value.data.data }));
      }
      if (categoryStatsRes.status === 'fulfilled') {
        setAnalytics(prev => ({ ...prev, categories: categoryStatsRes.value.data.data }));
      }
      if (notificationStatsRes.status === 'fulfilled') {
        setAnalytics(prev => ({ ...prev, notifications: notificationStatsRes.value.data.data }));
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
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
              <h1 className="mb-1">Analytics Dashboard</h1>
              <p className="text-muted mb-0">System performance and usage analytics</p>
            </div>
            <Button variant="outline-primary" onClick={fetchAnalytics}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setDateRange({
                        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                      })}
                    >
                      Last 7 Days
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setDateRange({
                        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                      })}
                    >
                      Last 30 Days
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setDateRange({
                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                      })}
                    >
                      This Month
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h3 className="mb-1">{analytics.users.totalUsers || 0}</h3>
              <p className="text-muted mb-0">Total Users</p>
              <small className="text-success">
                <i className="bi bi-arrow-up"></i> {analytics.users.newUsersThisMonth || 0} this month
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-calendar-event text-success" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h3 className="mb-1">{analytics.events.totalEvents || 0}</h3>
              <p className="text-muted mb-0">Total Events</p>
              <small className="text-info">
                <i className="bi bi-clock"></i> {analytics.events.upcomingEvents || 0} upcoming
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-person-check text-warning" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h3 className="mb-1">{analytics.registrations.totalRegistrations || 0}</h3>
              <p className="text-muted mb-0">Total Registrations</p>
              <small className="text-muted">All time</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-bell text-info" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h3 className="mb-1">{analytics.notifications.totalNotifications || 0}</h3>
              <p className="text-muted mb-0">Notifications Sent</p>
              <small className="text-muted">All time</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Analytics */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Events by Category</h5>
            </Card.Header>
            <Card.Body>
              {analytics.events.eventsByCategory && analytics.events.eventsByCategory.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Events</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.events.eventsByCategory.map(category => (
                      <tr key={category._id}>
                        <td>{category._id}</td>
                        <td>{category.count}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ 
                                  width: `${(category.count / analytics.events.totalEvents * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">
                              {((category.count / analytics.events.totalEvents) * 100).toFixed(1)}%
                            </small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No category data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Registration Status</h5>
            </Card.Header>
            <Card.Body>
              {analytics.registrations.statusStats && analytics.registrations.statusStats.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.registrations.statusStats.map(status => (
                      <tr key={status._id}>
                        <td>
                          <Badge bg={
                            status._id === 'confirmed' ? 'success' :
                            status._id === 'pending' ? 'warning' :
                            status._id === 'cancelled' ? 'danger' : 'secondary'
                          }>
                            {status._id}
                          </Badge>
                        </td>
                        <td>{status.count}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ 
                                  width: `${(status.count / analytics.registrations.totalRegistrations * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">
                              {((status.count / analytics.registrations.totalRegistrations) * 100).toFixed(1)}%
                            </small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No registration data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Role Distribution */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">User Role Distribution</h5>
            </Card.Header>
            <Card.Body>
              {analytics.users.roleStats && analytics.users.roleStats.length > 0 ? (
                analytics.users.roleStats.map(role => (
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
                    <div className="d-flex align-items-center">
                      <div className="progress me-3" style={{ width: '100px', height: '8px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ 
                            width: `${(role.count / analytics.users.totalUsers * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="fw-bold">{role.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No role data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Top Departments</h5>
            </Card.Header>
            <Card.Body>
              {analytics.users.departmentStats && analytics.users.departmentStats.length > 0 ? (
                analytics.users.departmentStats.slice(0, 8).map(dept => (
                  <div key={dept._id} className="d-flex justify-content-between align-items-center mb-3">
                    <span>{dept._id}</span>
                    <div className="d-flex align-items-center">
                      <div className="progress me-3" style={{ width: '100px', height: '8px' }}>
                        <div 
                          className="progress-bar bg-info" 
                          style={{ 
                            width: `${(dept.count / analytics.users.totalUsers * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="fw-bold">{dept.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No department data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
