import React from 'react';
import { Nav, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      title: 'Users',
      icon: 'bi-people',
      path: '/admin/users',
      active: location.pathname === '/admin/users'
    },
    {
      title: 'Participants',
      icon: 'bi-person-check',
      path: '/admin/participants',
      active: location.pathname === '/admin/participants'
    },
    {
      title: 'Events',
      icon: 'bi-calendar-event',
      path: '/manage-events',
      active: location.pathname === '/manage-events'
    },
    {
      title: 'Categories',
      icon: 'bi-folder',
      path: '/manage-categories',
      active: location.pathname === '/manage-categories'
    },
    {
      title: 'Analytics',
      icon: 'bi-graph-up',
      path: '/admin/analytics',
      active: location.pathname === '/admin/analytics'
    },
    {
      title: 'Notifications',
      icon: 'bi-bell',
      path: '/admin/notifications',
      active: location.pathname === '/admin/notifications'
    },
    {
      title: 'Settings',
      icon: 'bi-gear',
      path: '/admin/settings',
      active: location.pathname === '/admin/settings'
    }
  ];

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-0 py-3">
        <h6 className="mb-0 text-muted">ADMIN PANEL</h6>
      </Card.Header>
      <Card.Body className="p-0">
        <Nav className="flex-column">
          {menuItems.map((item, index) => (
            <Nav.Item key={index}>
              <Nav.Link
                as={Link}
                to={item.path}
                className={`d-flex align-items-center px-3 py-3 text-decoration-none ${
                  item.active ? 'bg-primary text-white' : 'text-dark'
                }`}
                style={{
                  borderRadius: 0,
                  borderLeft: item.active ? '4px solid #0d6efd' : '4px solid transparent'
                }}
              >
                <i className={`${item.icon} me-3`} style={{ fontSize: '1.1rem' }}></i>
                {item.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Body>
    </Card>
  );
};

export default AdminSidebar;
