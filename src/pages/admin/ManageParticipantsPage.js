import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, Button, Form, 
  Modal, Dropdown, Alert, Spinner, Tab, Tabs, ProgressBar 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageParticipantsPage = () => {
  const [participants, setParticipants] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalParticipants: 0,
    activeParticipants: 0,
    newThisMonth: 0,
    averageEventsPerParticipant: 0,
    topParticipants: [],
    departmentStats: [],
    registrationTrends: [],
    engagementStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchParticipants();
    fetchAnalytics();
  }, [filters, pagination.currentPage]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters
      if (filters.search.trim()) queryParams.append('search', filters.search);
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.status !== 'all') queryParams.append('isActive', filters.status === 'active');
      queryParams.append('role', 'participant');
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);
      queryParams.append('page', pagination.currentPage);
      queryParams.append('limit', pagination.itemsPerPage);

      const response = await axios.get(`/api/users?${queryParams}`);
      setParticipants(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination?.totalPages || 1,
        totalItems: response.data.pagination?.totalItems || 0
      }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [userStatsRes, registrationStatsRes] = await Promise.allSettled([
        axios.get('/api/users/stats'),
        axios.get('/api/registrations/admin/stats')
      ]);

      if (userStatsRes.status === 'fulfilled') {
        const userStats = userStatsRes.value.data.data;
        setAnalytics(prev => ({
          ...prev,
          totalParticipants: userStats.roleStats?.participant || 0,
          newThisMonth: userStats.newUsersThisMonth || 0,
          departmentStats: userStats.departmentStats || []
        }));
      }

      if (registrationStatsRes.status === 'fulfilled') {
        const regStats = registrationStatsRes.value.data.data;
        setAnalytics(prev => ({
          ...prev,
          averageEventsPerParticipant: regStats.averageRegistrationsPerUser || 0,
          topParticipants: regStats.topParticipants || [],
          registrationTrends: regStats.monthlyTrends || [],
          engagementStats: regStats.engagementStats || {}
        }));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleParticipantAction = async (participant, action) => {
    try {
      switch (action) {
        case 'view':
          setSelectedParticipant(participant);
          setShowDetailsModal(true);
          break;
        case 'activate':
          await axios.put(`/api/users/${participant._id}`, { isActive: true });
          toast.success('Participant activated successfully');
          fetchParticipants();
          break;
        case 'deactivate':
          await axios.put(`/api/users/${participant._id}`, { isActive: false });
          toast.success('Participant deactivated successfully');
          fetchParticipants();
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this participant?')) {
            await axios.delete(`/api/users/${participant._id}`);
            toast.success('Participant deleted successfully');
            fetchParticipants();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error(`Failed to ${action} participant`);
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge bg={isActive ? 'success' : 'danger'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getEngagementLevel = (registrationCount) => {
    if (registrationCount >= 10) return { level: 'High', color: 'success' };
    if (registrationCount >= 5) return { level: 'Medium', color: 'warning' };
    if (registrationCount >= 1) return { level: 'Low', color: 'info' };
    return { level: 'None', color: 'secondary' };
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Participants Management</h1>
              <p className="text-muted mb-0">Manage and analyze participant data</p>
            </div>
            <Button variant="primary" onClick={fetchParticipants}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Analytics Overview */}
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
                  <h3 className="mb-0">{analytics.totalParticipants.toLocaleString()}</h3>
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
                  <h3 className="mb-0">{analytics.newThisMonth}</h3>
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
                  <h3 className="mb-0">{analytics.averageEventsPerParticipant.toFixed(1)}</h3>
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
                    {analytics.totalParticipants > 0 
                      ? ((analytics.activeParticipants / analytics.totalParticipants) * 100).toFixed(1)
                      : 0}%
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="overview" title="Participants List">
                  {/* Filters */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search participants..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                        >
                          <option value="">All Departments</option>
                          {analytics.departmentStats.map(dept => (
                            <option key={dept._id} value={dept._id}>
                              {dept._id} ({dept.count})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Sort By</Form.Label>
                        <Form.Select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                          <option value="createdAt">Join Date</option>
                          <option value="firstName">Name</option>
                          <option value="department">Department</option>
                          <option value="lastLoginAt">Last Login</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Order</Form.Label>
                        <Form.Select
                          value={filters.sortOrder}
                          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Results Summary */}
                  <Row className="mb-3">
                    <Col>
                      <p className="text-muted">
                        Showing {participants.length} of {pagination.totalItems} participants
                      </p>
                    </Col>
                  </Row>

                  {/* Participants Table */}
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                    </div>
                  ) : participants.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Participant</th>
                            <th>Department</th>
                            <th>Events</th>
                            <th>Engagement</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map(participant => {
                            const engagement = getEngagementLevel(participant.registeredEvents?.length || 0);
                            return (
                              <tr key={participant._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                      <span className="text-primary fw-bold">
                                        {participant.firstName?.charAt(0)}{participant.lastName?.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <h6 className="mb-0">{participant.firstName} {participant.lastName}</h6>
                                      <small className="text-muted">{participant.email}</small>
                                      {participant.studentId && (
                                        <small className="text-muted d-block">ID: {participant.studentId}</small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>{participant.department || 'N/A'}</td>
                                <td>
                                  <span className="fw-bold">{participant.registeredEvents?.length || 0}</span>
                                  <small className="text-muted"> registered</small>
                                </td>
                                <td>
                                  <Badge bg={engagement.color}>{engagement.level}</Badge>
                                </td>
                                <td>{getStatusBadge(participant.isActive)}</td>
                                <td>
                                  <small className="text-muted">
                                    {new Date(participant.createdAt).toLocaleDateString()}
                                  </small>
                                </td>
                                <td>
                                  <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                                      <i className="bi bi-three-dots"></i>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item onClick={() => handleParticipantAction(participant, 'view')}>
                                        <i className="bi bi-eye me-2"></i>View Details
                                      </Dropdown.Item>
                                      {participant.isActive ? (
                                        <Dropdown.Item onClick={() => handleParticipantAction(participant, 'deactivate')}>
                                          <i className="bi bi-person-x me-2"></i>Deactivate
                                        </Dropdown.Item>
                                      ) : (
                                        <Dropdown.Item onClick={() => handleParticipantAction(participant, 'activate')}>
                                          <i className="bi bi-person-check me-2"></i>Activate
                                        </Dropdown.Item>
                                      )}
                                      <Dropdown.Divider />
                                      <Dropdown.Item 
                                        className="text-danger"
                                        onClick={() => handleParticipantAction(participant, 'delete')}
                                      >
                                        <i className="bi bi-trash me-2"></i>Delete
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                      <h4 className="mt-3">No Participants Found</h4>
                      <p className="text-muted">No participants match your current filters.</p>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="analytics" title="Analytics">
                  <Row>
                    <Col lg={6} className="mb-4">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                          <h6 className="mb-0">Top Participants</h6>
                        </Card.Header>
                        <Card.Body>
                          {analytics.topParticipants.length > 0 ? (
                            analytics.topParticipants.slice(0, 10).map((participant, index) => (
                              <div key={participant._id} className="d-flex align-items-center mb-3">
                                <div className="flex-shrink-0 me-3">
                                  <Badge bg="primary" className="rounded-pill">#{index + 1}</Badge>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0">{participant.firstName} {participant.lastName}</h6>
                                  <small className="text-muted">{participant.registrationCount} events</small>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted">No data available</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                          <h6 className="mb-0">Department Distribution</h6>
                        </Card.Header>
                        <Card.Body>
                          {analytics.departmentStats.length > 0 ? (
                            analytics.departmentStats.map(dept => (
                              <div key={dept._id} className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-medium">{dept._id || 'No Department'}</span>
                                  <span className="text-muted">{dept.count}</span>
                                </div>
                                <ProgressBar 
                                  now={(dept.count / analytics.totalParticipants) * 100} 
                                  style={{ height: '6px' }}
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-muted">No data available</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Participant Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Participant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant && (
            <Row>
              <Col md={6}>
                <h6>Personal Information</h6>
                <p><strong>Name:</strong> {selectedParticipant.firstName} {selectedParticipant.lastName}</p>
                <p><strong>Email:</strong> {selectedParticipant.email}</p>
                <p><strong>Phone:</strong> {selectedParticipant.phoneNumber || 'N/A'}</p>
                <p><strong>Department:</strong> {selectedParticipant.department || 'N/A'}</p>
                {selectedParticipant.studentId && (
                  <p><strong>Student ID:</strong> {selectedParticipant.studentId}</p>
                )}
              </Col>
              <Col md={6}>
                <h6>Activity Information</h6>
                <p><strong>Status:</strong> {getStatusBadge(selectedParticipant.isActive)}</p>
                <p><strong>Joined:</strong> {new Date(selectedParticipant.createdAt).toLocaleDateString()}</p>
                <p><strong>Events Registered:</strong> {selectedParticipant.registeredEvents?.length || 0}</p>
                <p><strong>Last Login:</strong> {selectedParticipant.lastLoginAt ? new Date(selectedParticipant.lastLoginAt).toLocaleDateString() : 'Never'}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ManageParticipantsPage;
