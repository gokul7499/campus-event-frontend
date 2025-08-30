import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Form, Button, Badge, 
  Table, Modal, Spinner 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SendNotificationPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    channels: {
      inApp: true,
      email: false,
      sms: false
    },
    scheduledFor: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users?limit=100');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNotificationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNotificationData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleUserSelection = (userId, selected) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationData.title.trim() || !notificationData.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      setSending(true);

      // Transform channels from boolean to object format expected by backend
      const transformedChannels = {
        inApp: {
          enabled: notificationData.channels.inApp
        },
        email: {
          enabled: notificationData.channels.email
        },
        sms: {
          enabled: notificationData.channels.sms
        }
      };

      const payload = {
        ...notificationData,
        channels: transformedChannels,
        recipients: selectedUsers,
        scheduledFor: notificationData.scheduledFor || undefined
      };

      console.log('=== SENDING NOTIFICATION ===');
      console.log('Payload:', payload);
      console.log('Channels:', transformedChannels);

      if (selectedUsers.length === 1) {
        await axios.post('/api/notifications/send', {
          ...payload,
          recipientId: selectedUsers[0]
        });
      } else {
        await axios.post('/api/notifications/send-bulk', {
          ...payload,
          recipientIds: selectedUsers
        });
      }

      toast.success(`Notification sent to ${selectedUsers.length} user(s)`);

      // Reset form
      setNotificationData({
        title: '',
        message: '',
        type: 'general',
        priority: 'normal',
        channels: {
          inApp: true,
          email: false,
          sms: false
        },
        scheduledFor: ''
      });
      setSelectedUsers([]);
      setShowPreview(false);

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getSelectedUsersInfo = () => {
    return users.filter(user => selectedUsers.includes(user._id));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Send Notification</h1>
              <p className="text-muted mb-0">Send notifications to users</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowPreview(true)}
              disabled={!notificationData.title.trim() || !notificationData.message.trim() || selectedUsers.length === 0}
            >
              <i className="bi bi-eye me-2"></i>
              Preview & Send
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Notification Form */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Notification Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Notification title"
                    value={notificationData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={200}
                  />
                  <Form.Text className="text-muted">
                    {notificationData.title.length}/200 characters
                  </Form.Text>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={notificationData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="system_announcement">System Announcement</option>
                    <option value="event_reminder">Event Reminder</option>
                    <option value="event_update">Event Update</option>
                  </Form.Select>
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Notification message"
                    value={notificationData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    maxLength={1000}
                  />
                  <Form.Text className="text-muted">
                    {notificationData.message.length}/1000 characters
                  </Form.Text>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={notificationData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Schedule For (Optional)</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={notificationData.scheduledFor}
                    onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </Col>
              </Row>

              <hr />

              <h6 className="mb-3">Delivery Channels</h6>
              <Row>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    id="channel-inapp"
                    label="In-App Notification"
                    checked={notificationData.channels.inApp}
                    onChange={(e) => handleInputChange('channels.inApp', e.target.checked)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    id="channel-email"
                    label="Email Notification"
                    checked={notificationData.channels.email}
                    onChange={(e) => handleInputChange('channels.email', e.target.checked)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    id="channel-sms"
                    label="SMS Notification"
                    checked={notificationData.channels.sms}
                    onChange={(e) => handleInputChange('channels.sms', e.target.checked)}
                    disabled
                  />
                  <Form.Text className="text-muted">Coming soon</Form.Text>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Recipients */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recipients ({selectedUsers.length} selected)</h5>
              <Form.Check
                type="switch"
                id="select-all"
                label="Select All"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table responsive hover className="mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th width="50">Select</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => handleUserSelection(user._id, e.target.checked)}
                          />
                        </td>
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
                          <Badge bg={
                            user.role === 'admin' ? 'danger' : 
                            user.role === 'organizer' ? 'warning' : 'info'
                          }>
                            {user.role}
                          </Badge>
                        </td>
                        <td>{user.department || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Preview */}
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Preview</h5>
            </Card.Header>
            <Card.Body>
              <div className="notification-preview border rounded p-3 mb-3">
                <div className="d-flex align-items-start">
                  <div className="flex-shrink-0 me-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-bell text-primary"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{notificationData.title || 'Notification Title'}</h6>
                    <p className="mb-1 text-muted small">{notificationData.message || 'Notification message will appear here...'}</p>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="primary" className="small">{notificationData.type.replace('_', ' ')}</Badge>
                      <Badge bg={
                        notificationData.priority === 'urgent' ? 'danger' :
                        notificationData.priority === 'high' ? 'warning' :
                        notificationData.priority === 'low' ? 'secondary' : 'info'
                      } className="small">
                        {notificationData.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <h6>Delivery Channels:</h6>
                <ul className="list-unstyled mb-0">
                  {notificationData.channels.inApp && <li><i className="bi bi-app text-primary me-2"></i>In-App</li>}
                  {notificationData.channels.email && <li><i className="bi bi-envelope text-success me-2"></i>Email</li>}
                  {notificationData.channels.sms && <li><i className="bi bi-phone text-info me-2"></i>SMS</li>}
                </ul>
              </div>

              {notificationData.scheduledFor && (
                <div className="mb-3">
                  <h6>Scheduled For:</h6>
                  <p className="text-muted small mb-0">
                    {new Date(notificationData.scheduledFor).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <h6>Recipients:</h6>
                <p className="text-muted small mb-0">{selectedUsers.length} user(s) selected</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Send Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            You are about to send this notification to {selectedUsers.length} user(s).
          </Alert>

          <div className="notification-preview border rounded p-3 mb-3">
            <div className="d-flex align-items-start">
              <div className="flex-shrink-0 me-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <i className="bi bi-bell text-primary"></i>
                </div>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1">{notificationData.title}</h6>
                <p className="mb-1 text-muted">{notificationData.message}</p>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="primary" className="small">{notificationData.type.replace('_', ' ')}</Badge>
                  <Badge bg={
                    notificationData.priority === 'urgent' ? 'danger' :
                    notificationData.priority === 'high' ? 'warning' :
                    notificationData.priority === 'low' ? 'secondary' : 'info'
                  } className="small">
                    {notificationData.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <h6>Recipients:</h6>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {getSelectedUsersInfo().map(user => (
              <div key={user._id} className="d-flex align-items-center mb-2">
                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                  <span className="text-primary fw-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h6 className="mb-0 small">{user.firstName} {user.lastName}</h6>
                  <small className="text-muted">{user.email}</small>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendNotification}
            disabled={sending}
          >
            {sending ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-send me-2"></i>}
            Send Notification
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default SendNotificationPage;
