import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-custom mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="text-white mb-3">
              <i className="bi bi-calendar-event me-2"></i>
              Campus Events
            </h5>
            <p className="text-light">
              Streamlining event organization and communication in educational institutions. 
              Discover, register, and manage campus events with ease.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="bi bi-facebook" style={{ fontSize: '1.2rem' }}></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-twitter" style={{ fontSize: '1.2rem' }}></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-instagram" style={{ fontSize: '1.2rem' }}></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-linkedin" style={{ fontSize: '1.2rem' }}></i>
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/events" className="text-light text-decoration-none">
                  Events
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">
                  Contact
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">For Students</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/register" className="text-light text-decoration-none">
                  Sign Up
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/events" className="text-light text-decoration-none">
                  Browse Events
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/help" className="text-light text-decoration-none">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-light text-decoration-none">
                  FAQ
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">For Organizers</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/create-event" className="text-light text-decoration-none">
                  Create Event
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/organizer-guide" className="text-light text-decoration-none">
                  Organizer Guide
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/resources" className="text-light text-decoration-none">
                  Resources
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/support" className="text-light text-decoration-none">
                  Support
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/privacy" className="text-light text-decoration-none">
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-light text-decoration-none">
                  Terms of Service
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cookies" className="text-light text-decoration-none">
                  Cookie Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/accessibility" className="text-light text-decoration-none">
                  Accessibility
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-light" />

        <Row className="align-items-center">
          <Col md={6}>
            <p className="text-light mb-0">
              &copy; {currentYear} Campus Event Management System. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="text-light mb-0">
              Made with <i className="bi bi-heart-fill text-danger"></i> for educational institutions
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
