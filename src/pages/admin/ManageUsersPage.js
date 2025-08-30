import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Table, Button, Badge, Form,
  InputGroup, Modal, Spinner, Pagination, Dropdown
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import ApiTest from '../../components/common/ApiTest';

const ManageUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    department: '',
    isActive: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'delete'

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Clean filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...cleanFilters
      });

      console.log('=== FETCHING USERS ===');
      console.log('Pagination state:', pagination);
      console.log('Filters state:', filters);
      console.log('Clean filters:', cleanFilters);
      console.log('Final params:', params.toString());
      console.log('Request URL:', `/api/users?${params}`);

      const response = await axios.get(`/api/users?${params}`);

      console.log('=== API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Users array:', response.data.data);
      console.log('Users count:', response.data.data?.length);
      console.log('Pagination info:', response.data.pagination);

      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.totalItems || 0,
          pages: response.data.pagination?.totalPages || 1
        }));
        console.log('=== STATE UPDATED ===');
        console.log('Users set to:', response.data.data);
        console.log('Pagination updated:', {
          total: response.data.pagination?.totalItems || 0,
          pages: response.data.pagination?.totalPages || 1
        });
      } else {
        console.error('Invalid response structure:', response.data);
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
      }
    } catch (error) {
      console.error('=== ERROR FETCHING USERS ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setModalType(action);
    setShowModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      await axios.put(`/api/users/${selectedUser._id}`, userData);
      toast.success('User updated successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'organizer': return 'warning';
      case 'participant': return 'info';
      default: return 'secondary';
    }
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <AdminLayout>
      {/* API Test Component - Remove after debugging */}
      <ApiTest />

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Manage Users</h1>
              <p className="text-muted mb-0">Manage system users and their permissions</p>
            </div>
            <Button variant="primary" onClick={() => handleUserAction(null, 'create')}>
              <i className="bi bi-plus-circle me-2"></i>
              Add User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col lg={3} md={6} className="mb-3">
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search users..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col lg={2} md={6} className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="organizer">Organizer</option>
                    <option value="participant">Participant</option>
                  </Form.Select>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Department"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  />
                </Col>
                <Col lg={2} md={6} className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Col>
                <Col lg={2} md={12} className="mb-3">
                  <Form.Label>&nbsp;</Form.Label>
                  <div className="d-grid">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setFilters({ search: '', role: '', department: '', isActive: '' });
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Users ({pagination.total})</h5>
              <div className="d-flex align-items-center">
                <span className="text-muted me-3">Show:</span>
                <Form.Select
                  size="sm"
                  style={{ width: 'auto' }}
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="p-3 bg-light">
                  <strong>Debug Info:</strong>
                  <div>Users array length: {users.length}</div>
                  <div>Users array: {JSON.stringify(users.slice(0, 2), null, 2)}</div>
                  <div>Pagination total: {pagination.total}</div>
                  <div>Loading: {loading.toString()}</div>
                </div>
              ) && users.length > 0 ? (
                <>
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Events</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(userItem => (
                        <tr key={userItem._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                <span className="text-primary fw-bold">
                                  {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0">{userItem.firstName} {userItem.lastName}</h6>
                                <small className="text-muted">{userItem.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={getRoleBadgeColor(userItem.role)}>
                              {userItem.role}
                            </Badge>
                          </td>
                          <td>{userItem.department || 'N/A'}</td>
                          <td>
                            <span className="fw-bold">{userItem.createdEvents?.length || 0}</span>
                            <small className="text-muted"> created</small>
                            <br />
                            <span className="fw-bold">{userItem.registeredEvents?.length || 0}</span>
                            <small className="text-muted"> registered</small>
                          </td>
                          <td>
                            <Badge bg={userItem.isActive ? 'success' : 'danger'}>
                              {userItem.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleUserAction(userItem, 'view')}>
                                  <i className="bi bi-eye me-2"></i>View
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleUserAction(userItem, 'edit')}>
                                  <i className="bi bi-pencil me-2"></i>Edit
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleUserAction(userItem, 'delete')}
                                  disabled={userItem._id === user._id}
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

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="d-flex justify-content-center py-3">
                      <Pagination>
                        <Pagination.Prev 
                          disabled={pagination.page === 1}
                          onClick={() => handlePageChange(pagination.page - 1)}
                        />
                        {[...Array(pagination.pages)].map((_, index) => (
                          <Pagination.Item
                            key={index + 1}
                            active={pagination.page === index + 1}
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          disabled={pagination.page === pagination.pages}
                          onClick={() => handlePageChange(pagination.page + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No Users Found</h4>
                  <p className="text-muted">No users match your current filters.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Modal - Will be implemented in next part */}
      <UserModal
        show={showModal}
        onHide={() => setShowModal(false)}
        user={selectedUser}
        type={modalType}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </AdminLayout>
  );
};

// Placeholder for UserModal component
const UserModal = ({ show, onHide, user, type, onUpdate, onDelete }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'view' && 'User Details'}
          {type === 'edit' && 'Edit User'}
          {type === 'create' && 'Create User'}
          {type === 'delete' && 'Delete User'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>User modal functionality will be implemented here.</p>
        {user && (
          <div>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {type === 'delete' && (
          <Button variant="danger" onClick={onDelete}>
            Delete User
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ManageUsersPage;
