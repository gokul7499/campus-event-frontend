import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, ProgressBar,
  Form, Button, Alert, Spinner 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';

const ParticipantAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalParticipants: 0,
      activeParticipants: 0,
      newThisMonth: 0,
      averageEventsPerParticipant: 0
    },
    engagement: {
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0,
      noEngagement: 0
    },
    topParticipants: [],
    departmentStats: [],
    monthlyTrends: [],
    eventPopularity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [userStatsRes, registrationStatsRes] = await Promise.allSettled([
        axios.get('/api/users/stats'),
        axios.get('/api/registrations/admin/stats')
      ]);

      if (userStatsRes.status === 'fulfilled') {
        const userStats = userStatsRes.value.data.data;
        setAnalytics(prev => ({
          ...prev,
          overview: {
            totalParticipants: userStats.roleStats?.participant || 0,
            activeParticipants: userStats.roleStats?.participant || 0, // Assuming all are active for now
            newThisMonth: userStats.newUsersThisMonth || 0,
            averageEventsPerParticipant: 0 // Will be updated from registration stats
          },
          departmentStats: userStats.departmentStats || []
        }));
      }

      if (registrationStatsRes.status === 'fulfilled') {
        const regStats = registrationStatsRes.value.data.data;
        setAnalytics(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            averageEventsPerParticipant: regStats.averageRegistrationsPerUser || 0
          },
          topParticipants: regStats.topParticipants || [],
          monthlyTrends: regStats.monthlyTrends || [],
          engagement: {
            highEngagement: regStats.engagementStats?.highEngagementUsers || 0,
            mediumEngagement: regStats.engagementStats?.totalUniqueParticipants - 
                             (regStats.engagementStats?.highEngagementUsers || 0) - 
                             (regStats.engagementStats?.lowEngagementUsers || 0) || 0,
            lowEngagement: regStats.engagementStats?.lowEngagementUsers || 0,
            noEngagement: Math.max(0, (prev.overview.totalParticipants || 0) - 
                                     (regStats.engagementStats?.totalUniqueParticipants || 0))
          }
        }));
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (level) => {
    const colors = {
      high: 'success',
      medium: 'warning', 
      low: 'info',
      none: 'secondary'
    };
    return colors[level] || 'secondary';
  };

  const getEngagementPercentage = (count) => {
    return analytics.overview.totalParticipants > 0 
      ? ((count / analytics.overview.totalParticipants) * 100).toFixed(1)
      : 0;
  };

  const formatTrendMonth = (trend) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[trend._id.month - 1]} ${trend._id.year}`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Participant Analytics</h1>
              <p className="text-muted mb-0">Detailed insights into participant engagement and behavior</p>
            </div>
            <Button variant="primary" onClick={fetchAnalytics}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh Data
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
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Button variant="outline-primary" onClick={fetchAnalytics}>
                    Apply Filter
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-3">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Participants</h6>
                      <h3 className="mb-0">{analytics.overview.totalParticipants.toLocaleString()}</h3>
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
                        <i className="bi bi-person-plus text-success" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">New This Month</h6>
                      <h3 className="mb-0">{analytics.overview.newThisMonth}</h3>
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
                        <i className="bi bi-calendar-event text-info" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Avg Events/Participant</h6>
                      <h3 className="mb-0">{analytics.overview.averageEventsPerParticipant.toFixed(1)}</h3>
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
                        <i className="bi bi-graph-up text-warning" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Active Rate</h6>
                      <h3 className="mb-0">
                        {analytics.overview.totalParticipants > 0 
                          ? ((analytics.overview.activeParticipants / analytics.overview.totalParticipants) * 100).toFixed(1)
                          : 0}%
                      </h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Engagement Analysis */}
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="mb-0">Engagement Levels</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-medium">High Engagement (5+ events)</span>
                      <span className="text-muted">{analytics.engagement.highEngagement} ({getEngagementPercentage(analytics.engagement.highEngagement)}%)</span>
                    </div>
                    <ProgressBar 
                      variant={getEngagementColor('high')}
                      now={getEngagementPercentage(analytics.engagement.highEngagement)} 
                      style={{ height: '8px' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-medium">Medium Engagement (2-4 events)</span>
                      <span className="text-muted">{analytics.engagement.mediumEngagement} ({getEngagementPercentage(analytics.engagement.mediumEngagement)}%)</span>
                    </div>
                    <ProgressBar 
                      variant={getEngagementColor('medium')}
                      now={getEngagementPercentage(analytics.engagement.mediumEngagement)} 
                      style={{ height: '8px' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-medium">Low Engagement (1 event)</span>
                      <span className="text-muted">{analytics.engagement.lowEngagement} ({getEngagementPercentage(analytics.engagement.lowEngagement)}%)</span>
                    </div>
                    <ProgressBar 
                      variant={getEngagementColor('low')}
                      now={getEngagementPercentage(analytics.engagement.lowEngagement)} 
                      style={{ height: '8px' }}
                    />
                  </div>
                  
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-medium">No Engagement</span>
                      <span className="text-muted">{analytics.engagement.noEngagement} ({getEngagementPercentage(analytics.engagement.noEngagement)}%)</span>
                    </div>
                    <ProgressBar 
                      variant={getEngagementColor('none')}
                      now={getEngagementPercentage(analytics.engagement.noEngagement)} 
                      style={{ height: '8px' }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Top Participants */}
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="mb-0">Top Participants</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.topParticipants.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {analytics.topParticipants.slice(0, 10).map((participant, index) => (
                        <div key={participant._id} className="d-flex align-items-center mb-3">
                          <div className="flex-shrink-0 me-3">
                            <Badge bg="primary" className="rounded-pill">#{index + 1}</Badge>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0">{participant.firstName} {participant.lastName}</h6>
                            <small className="text-muted">{participant.email}</small>
                          </div>
                          <div className="text-end">
                            <span className="fw-bold">{participant.registrationCount}</span>
                            <small className="text-muted d-block">events</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No participant data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Department Distribution */}
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="mb-0">Department Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.departmentStats.length > 0 ? (
                    analytics.departmentStats.map(dept => (
                      <div key={dept._id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">{dept._id || 'No Department'}</span>
                          <span className="text-muted">{dept.count} ({((dept.count / analytics.overview.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                        <ProgressBar 
                          now={(dept.count / analytics.overview.totalParticipants) * 100} 
                          style={{ height: '6px' }}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No department data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Monthly Trends */}
            <Col lg={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="mb-0">Registration Trends</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.monthlyTrends.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {analytics.monthlyTrends.slice(-6).map((trend, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-medium">{formatTrendMonth(trend)}</span>
                          <div className="d-flex align-items-center">
                            <span className="me-3">{trend.count} registrations</span>
                            <div style={{ width: '100px' }}>
                              <ProgressBar 
                                now={(trend.count / Math.max(...analytics.monthlyTrends.map(t => t.count))) * 100} 
                                style={{ height: '6px' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No trend data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AdminLayout>
  );
};

export default ParticipantAnalyticsPage;
