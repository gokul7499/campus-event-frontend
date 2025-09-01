import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import HealthCheck from './HealthCheck';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      fixed="top" 
      className="shadow-sm navbar-custom"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <i className="bi bi-calendar-event me-2"></i>
          Campus Events
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={handleNavClick}
              className={isActive('/') ? 'active' : ''}
            >
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/events" 
              onClick={handleNavClick}
              className={isActive('/events') ? 'active' : ''}
            >
              Events
            </Nav.Link>

            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <NavDropdown title="Manage" id="manage-nav-dropdown">
                <NavDropdown.Item as={Link} to="/create-event" onClick={handleNavClick}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Event
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/manage-events" onClick={handleNavClick}>
                  <i className="bi bi-calendar-check me-2"></i>
                  Manage Events
                </NavDropdown.Item>
                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/manage-categories" onClick={handleNavClick}>
                      <i className="bi bi-folder me-2"></i>
                      Manage Categories
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/users" onClick={handleNavClick}>
                      <i className="bi bi-people me-2"></i>
                      Manage Users
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/analytics" onClick={handleNavClick}>
                      <i className="bi bi-graph-up me-2"></i>
                      Analytics
                    </NavDropdown.Item>
                  </>
                )}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/notifications" onClick={handleNavClick}>
                      <i className="bi bi-bell me-2"></i>
                      Send Notifications
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            )}
          </Nav>

          <Nav>
            {/* Health Check - only show in development or when backend is down */}
            {process.env.NODE_ENV === 'development' && (
              <Nav.Item className="d-flex align-items-center me-3">
                <HealthCheck />
              </Nav.Item>
            )}
            
            {user ? (
              <>
                {/* Notifications */}
                <Nav.Link 
                  as={Link} 
                  to="/notifications" 
                  onClick={handleNavClick}
                  className="position-relative"
                >
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Nav.Link>

                {/* User Dropdown */}
                <NavDropdown 
                  title={
                    <span>
                      <i className="bi bi-person-circle me-1"></i>
                      {user.firstName} {user.lastName}
                    </span>
                  } 
                  id="user-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/dashboard" onClick={handleNavClick}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </NavDropdown.Item>
                  
                  <NavDropdown.Item as={Link} to="/profile" onClick={handleNavClick}>
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/my-registrations" onClick={handleNavClick}>
                    <i className="bi bi-calendar-check me-2"></i>
                    My Registrations
                  </NavDropdown.Item>

                  {(user.role === 'organizer' || user.role === 'admin') && (
                    <NavDropdown.Item as={Link} to="/manage-events" onClick={handleNavClick}>
                      <i className="bi bi-calendar-plus me-2"></i>
                      My Events
                    </NavDropdown.Item>
                  )}

                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  onClick={handleNavClick}
                  className={isActive('/login') ? 'active' : ''}
                >
                  Login
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  onClick={handleNavClick}
                  className={`btn btn-primary text-white ms-2 ${isActive('/register') ? 'active' : ''}`}
                >
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
