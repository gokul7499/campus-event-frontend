import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Tabs, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    department: '',
    year: '',
    interests: []
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    eventUpdates: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        department: user.department || '',
        year: user.year || '',
        interests: user.interests || []
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword({
        passwordCurrent: passwordData.currentPassword,
        password: passwordData.newPassword
      });

      if (result.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await axios.put('/api/auth/notifications', notifications);
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">My Profile</h1>
        </Col>
      </Row>

      <Row>
        <Col lg={3}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i>
              </div>
              <h5>{user.firstName} {user.lastName}</h5>
              <p className="text-muted">{user.email}</p>
              <p className="text-muted">
                <i className="bi bi-shield-check me-1"></i>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <i className="bi bi-key me-1"></i>
                Change Password
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="profile" title="Profile Information">
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              firstName: e.target.value
                            })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              lastName: e.target.value
                            })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              email: e.target.value
                            })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              phone: e.target.value
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Select
                            value={profileData.department}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              department: e.target.value
                            })}
                          >
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Business">Business</option>
                            <option value="Arts">Arts</option>
                            <option value="Sciences">Sciences</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Law">Law</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Year</Form.Label>
                          <Form.Select
                            value={profileData.year}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              year: e.target.value
                            })}
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Graduate">Graduate</option>
                            <option value="PhD">PhD</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Staff">Staff</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          bio: e.target.value
                        })}
                        placeholder="Tell us about yourself..."
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="notifications" title="Notifications">
                  <h5 className="mb-3">Notification Preferences</h5>

                  <Form.Check
                    type="switch"
                    id="email-notifications"
                    label="Email Notifications"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailNotifications: e.target.checked
                    })}
                    className="mb-3"
                  />

                  <Form.Check
                    type="switch"
                    id="event-reminders"
                    label="Event Reminders"
                    checked={notifications.eventReminders}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      eventReminders: e.target.checked
                    })}
                    className="mb-3"
                  />

                  <Form.Check
                    type="switch"
                    id="event-updates"
                    label="Event Updates"
                    checked={notifications.eventUpdates}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      eventUpdates: e.target.checked
                    })}
                    className="mb-3"
                  />

                  <Form.Check
                    type="switch"
                    id="marketing-emails"
                    label="Marketing Emails"
                    checked={notifications.marketingEmails}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      marketingEmails: e.target.checked
                    })}
                    className="mb-3"
                  />

                  <Button
                    variant="primary"
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Preferences'}
                  </Button>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value
                })}
                required
                minLength={6}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
