import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  ListGroup, Spinner, Alert, Modal, Dropdown 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'unread') params.append('isRead', 'false');
      if (filter === 'read') params.append('isRead', 'true');
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await axios.get(`/api/notifications?${params}`);
      setNotifications(response.data.data || []);
      
      // Get unread count
      const unreadResponse = await axios.get('/api/notifications?isRead=false&limit=1');
      setUnreadCount(unreadResponse.data.pagination?.totalItems || 0);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAsRead(true);
      await axios.put('/api/notifications/read-all');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      event_registration: 'bi-calendar-check',
      event_reminder: 'bi-clock',
      event_update: 'bi-pencil-square',
      event_cancellation: 'bi-x-circle',
      event_approval: 'bi-check-circle',
      event_rejection: 'bi-x-circle',
      system_announcement: 'bi-megaphone',
      password_reset: 'bi-key',
      account_verification: 'bi-shield-check',
      general: 'bi-info-circle'
    };
    return iconMap[type] || 'bi-bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      event_registration: 'success',
      event_reminder: 'warning',
      event_update: 'info',
      event_cancellation: 'danger',
      event_approval: 'success',
      event_rejection: 'danger',
      system_announcement: 'primary',
      password_reset: 'warning',
      account_verification: 'info',
      general: 'secondary'
    };
    return colorMap[type] || 'secondary';
  };

  const formatNotificationType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && notifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Notifications</h1>
              <p className="text-muted mb-0">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                onClick={fetchNotifications}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="primary" 
                  onClick={handleMarkAllAsRead}
                  disabled={markingAsRead}
                >
                  {markingAsRead ? <Spinner size="sm" className="me-2" /> : null}
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Filter by Status</Form.Label>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Filter by Type</Form.Label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="event_registration">Event Registration</option>
                    <option value="event_reminder">Event Reminder</option>
                    <option value="event_update">Event Update</option>
                    <option value="event_cancellation">Event Cancellation</option>
                    <option value="system_announcement">System Announcement</option>
                    <option value="general">General</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications List */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Your Notifications</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : notifications.length > 0 ? (
                <ListGroup variant="flush">
                  {notifications.map(notification => (
                    <ListGroup.Item
                      key={notification._id}
                      className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className={`bg-${getNotificationColor(notification.type)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                            <i className={`${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)}`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{notification.title}</h6>
                              <p className="mb-1 text-muted">{notification.message}</p>
                              <div className="d-flex align-items-center gap-3">
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(notification.createdAt).toLocaleString()}
                                </small>
                                <Badge bg={getNotificationColor(notification.type)} className="small">
                                  {formatNotificationType(notification.type)}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge bg="primary" className="small">New</Badge>
                                )}
                              </div>
                            </div>
                            <Dropdown onClick={(e) => e.stopPropagation()}>
                              <Dropdown.Toggle variant="link" size="sm" className="text-muted">
                                <i className="bi bi-three-dots-vertical"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {!notification.isRead && (
                                  <Dropdown.Item onClick={() => handleMarkAsRead(notification._id)}>
                                    <i className="bi bi-check me-2"></i>Mark as Read
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDeleteNotification(notification._id)}
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-bell-slash text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No Notifications</h4>
                  <p className="text-muted">
                    {filter === 'unread' ? 'No unread notifications' : 'You have no notifications yet.'}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notification Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`${getNotificationIcon(selectedNotification?.type)} me-2`}></i>
            {selectedNotification?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <div className="mb-3">
                <Badge bg={getNotificationColor(selectedNotification.type)}>
                  {formatNotificationType(selectedNotification.type)}
                </Badge>
                {!selectedNotification.isRead && (
                  <Badge bg="primary" className="ms-2">New</Badge>
                )}
              </div>
              <p>{selectedNotification.message}</p>
              <hr />
              <small className="text-muted">
                <strong>Received:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
                {selectedNotification.readAt && (
                  <>
                    <br />
                    <strong>Read:</strong> {new Date(selectedNotification.readAt).toLocaleString()}
                  </>
                )}
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedNotification && !selectedNotification.isRead && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleMarkAsRead(selectedNotification._id);
                setShowModal(false);
              }}
            >
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NotificationsPage;
