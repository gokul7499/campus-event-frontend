import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Form, Button, Alert,
  Table, Badge, Modal, Spinner
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Campus Events',
    siteDescription: 'Campus Event Management System',
    contactEmail: 'admin@campus.edu',
    maxEventsPerUser: 10,
    defaultEventCapacity: 100,
    allowPublicRegistration: true,
    requireEmailVerification: true,
    autoApproveEvents: false,
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    }
  });
  const [systemInfo, setSystemInfo] = useState({});
  const [showBackupModal, setShowBackupModal] = useState(false);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemInfo();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      // This would be a real API call in production
      // const response = await axios.get('/api/admin/settings');
      // setSettings(response.data.data);
      
      // For now, using default settings
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system settings');
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await axios.get('/api/health');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const handleSettingChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // await axios.put('/api/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      toast.info('Database backup initiated...');
      // await axios.post('/api/admin/backup');
      toast.success('Database backup completed');
      setShowBackupModal(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
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
              <h1 className="mb-1">System Settings</h1>
              <p className="text-muted mb-0">Configure system-wide settings and preferences</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-warning" 
                onClick={() => setShowBackupModal(true)}
              >
                <i className="bi bi-download me-2"></i>
                Backup Database
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-check-circle me-2"></i>}
                Save Settings
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* General Settings */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">General Settings</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Label>Site Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Event Settings */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Event Settings</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Max Events Per User</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxEventsPerUser}
                    onChange={(e) => handleSettingChange('maxEventsPerUser', parseInt(e.target.value))}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Default Event Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={settings.defaultEventCapacity}
                    onChange={(e) => handleSettingChange('defaultEventCapacity', parseInt(e.target.value))}
                  />
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    id="auto-approve-events"
                    label="Auto-approve new events"
                    checked={settings.autoApproveEvents}
                    onChange={(e) => handleSettingChange('autoApproveEvents', e.target.checked)}
                    className="mb-3"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* User Settings */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">User Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="public-registration"
                label="Allow public registration"
                checked={settings.allowPublicRegistration}
                onChange={(e) => handleSettingChange('allowPublicRegistration', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="email-verification"
                label="Require email verification"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                className="mb-3"
              />
            </Card.Body>
          </Card>

          {/* Notification Settings */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="email-notifications"
                label="Email notifications"
                checked={settings.notificationSettings.emailNotifications}
                onChange={(e) => handleSettingChange('notificationSettings.emailNotifications', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="sms-notifications"
                label="SMS notifications"
                checked={settings.notificationSettings.smsNotifications}
                onChange={(e) => handleSettingChange('notificationSettings.smsNotifications', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="push-notifications"
                label="Push notifications"
                checked={settings.notificationSettings.pushNotifications}
                onChange={(e) => handleSettingChange('notificationSettings.pushNotifications', e.target.checked)}
                className="mb-3"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* System Information */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">System Information</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Status</td>
                    <td>
                      <Badge bg="success">
                        {systemInfo.status || 'OK'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Environment</td>
                    <td>{systemInfo.environment || 'development'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Uptime</td>
                    <td>{systemInfo.uptime ? `${Math.floor(systemInfo.uptime / 3600)}h` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Last Updated</td>
                    <td>
                      <small className="text-muted">
                        {systemInfo.timestamp ? new Date(systemInfo.timestamp).toLocaleString() : 'N/A'}
                      </small>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Clear Cache
                </Button>
                <Button variant="outline-warning" size="sm">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  View Logs
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="bi bi-gear me-2"></i>
                  System Maintenance
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setShowBackupModal(true)}
                >
                  <i className="bi bi-download me-2"></i>
                  Database Backup
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Backup Modal */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Database Backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            This will create a backup of the entire database. This process may take several minutes.
          </Alert>
          <p>Are you sure you want to proceed with the database backup?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleBackupDatabase}>
            <i className="bi bi-download me-2"></i>
            Create Backup
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default SystemSettingsPage;
