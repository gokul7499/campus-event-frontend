import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0
  });

  useEffect(() => {
    fetchHomeData();

    // Add scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');

          // Animate counters
          if (entry.target.classList.contains('stat-number')) {
            animateCounter(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all scroll-animate elements
    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach(el => observer.observe(el));

    // Observe stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured events
      const featuredResponse = await axios.get('/api/events?isFeatured=true&limit=3');
      setFeaturedEvents(featuredResponse.data.data);

      // Fetch upcoming events
      const upcomingResponse = await axios.get('/api/events?limit=6&sortBy=startDate&sortOrder=asc');
      setUpcomingEvents(upcomingResponse.data.data);

      // Fetch basic stats (if available)
      try {
        const statsResponse = await axios.get('/api/events/admin/stats');
        setStats(statsResponse.data.data);
      } catch (error) {
        // Stats might not be available for non-admin users
        console.log('Stats not available');
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading campus events..." />;
  }

  return (
    <div className="homepage-modern">
      {/* Stunning Hero Section */}
      <section className="hero-gradient-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>

          <Container className="hero-content">
            <Row className="align-items-center min-vh-100">
              <Col lg={6} className="hero-text">
                <div className="hero-badge mb-4">
                  <span className="badge-text">🎉 Campus Events Platform</span>
                </div>
                <h1 className="hero-title">
                  Discover
                  <span className="gradient-text"> Amazing</span>
                  <br />
                  Campus Events
                </h1>
                <p className="hero-description">
                  Join the most vibrant campus community! Explore incredible events,
                  connect with amazing people, and create unforgettable memories.
                </p>
                <div className="hero-buttons">
                  <Button as={Link} to="/events" className="btn-primary-gradient btn-lg btn-ripple btn-magnetic btn-glow">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Explore Events
                    <span className="btn-shine"></span>
                  </Button>
                  {!user && (
                    <Button as={Link} to="/register" className="btn-glass btn-lg btn-ripple btn-magnetic">
                      <i className="bi bi-stars me-2"></i>
                      Join Community
                    </Button>
                  )}
                </div>

                {/* Floating Stats */}
                <div className="floating-stats">
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-number">{stats.totalEvents || '50+'}</div>
                    <div className="stat-label">Active Events</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-number">{stats.totalUsers || '1K+'}</div>
                    <div className="stat-label">Students</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-number">{stats.totalRegistrations || '500+'}</div>
                    <div className="stat-label">Registrations</div>
                  </div>
                </div>
              </Col>

              <Col lg={6} className="hero-visual">
                <div className="hero-illustration">
                  <div className="illustration-container">
                    <div className="event-card-demo card-1">
                      <div className="demo-header">
                        <div className="demo-badge">🎨 Workshop</div>
                      </div>
                      <div className="demo-title">Design Thinking</div>
                      <div className="demo-date">Dec 25, 2024</div>
                    </div>

                    <div className="event-card-demo card-2">
                      <div className="demo-header">
                        <div className="demo-badge">🎵 Concert</div>
                      </div>
                      <div className="demo-title">Music Festival</div>
                      <div className="demo-date">Jan 15, 2025</div>
                    </div>

                    <div className="event-card-demo card-3">
                      <div className="demo-header">
                        <div className="demo-badge">🏆 Competition</div>
                      </div>
                      <div className="demo-title">Hackathon 2025</div>
                      <div className="demo-date">Feb 10, 2025</div>
                    </div>
                  </div>

                  <div className="pulse-rings">
                    <div className="pulse-ring ring-1"></div>
                    <div className="pulse-ring ring-2"></div>
                    <div className="pulse-ring ring-3"></div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="featured-events-modern">
          <Container>
            <div className="section-header text-center mb-5 scroll-animate">
              <div className="section-badge">
                <span>✨ Featured</span>
              </div>
              <h2 className="section-title">
                Spotlight Events
              </h2>
              <p className="section-subtitle">
                Handpicked amazing events you absolutely can't miss
              </p>
            </div>

            <Row className="featured-grid">
              {featuredEvents.map((event, index) => (
                <Col lg={4} md={6} key={event._id} className="mb-4">
                  <div className={`modern-event-card featured-card-${index + 1} scroll-animate`}>
                    <div className="card-glow"></div>
                    <div className="card-content">
                      <div className="card-header">
                        <div className="event-badges">
                          <span className="category-badge">
                            {event.category?.name || 'Event'}
                          </span>
                          <span className="featured-badge">
                            <i className="bi bi-star-fill"></i>
                            Featured
                          </span>
                        </div>
                        <div className="card-image">
                          {event.images?.banner?.medium ? (
                            <img
                              src={event.images.banner.medium}
                              alt={event.title}
                              className="event-image"
                            />
                          ) : (
                            <div className="placeholder-image">
                              <i className="bi bi-calendar-event"></i>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-body">
                        <h3 className="event-title">{event.title}</h3>
                        <p className="event-description">
                          {event.description.substring(0, 120)}...
                        </p>

                        <div className="event-meta">
                          <div className="meta-item">
                            <i className="bi bi-calendar3"></i>
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="bi bi-clock"></i>
                            <span>{formatTime(event.startDate)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="bi bi-geo-alt"></i>
                            <span>{event.venue.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <Button
                          as={Link}
                          to={`/events/${event._id}`}
                          className="btn-modern-primary btn-ripple btn-magnetic btn-3d"
                        >
                          <span>Explore Event</span>
                          <i className="bi bi-arrow-right"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <div className="section-header text-center mb-5 scroll-animate">
            <div className="section-badge">
              <span>🚀 Features</span>
            </div>
            <h2 className="section-title">
              Why Choose Our Platform?
            </h2>
            <p className="section-subtitle">
              Experience the future of campus event management
            </p>
          </div>

          <Row className="features-grid">
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card feature-1 scroll-animate">
                <div className="feature-icon">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h3>Instant Registration</h3>
                <p>Register for events in seconds with our lightning-fast system</p>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card feature-2 scroll-animate">
                <div className="feature-icon">
                  <i className="bi bi-bell"></i>
                </div>
                <h3>Smart Notifications</h3>
                <p>Never miss an event with intelligent reminders and updates</p>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card feature-3 scroll-animate">
                <div className="feature-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h3>Community Driven</h3>
                <p>Connect with like-minded students and build lasting friendships</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Upcoming Events Section */}
      <section className="upcoming-events-modern">
        <Container>
          <div className="section-header text-center mb-5">
            <div className="section-badge">
              <span>📅 Coming Soon</span>
            </div>
            <h2 className="section-title">
              Upcoming Events
            </h2>
            <p className="section-subtitle">
              Mark your calendar for these exciting upcoming events
            </p>
          </div>

          <div className="upcoming-events-grid">
            {upcomingEvents.slice(0, 6).map((event, index) => (
              <div key={event._id} className={`upcoming-event-card card-${index + 1}`}>
                <div className="event-date">
                  <div className="date-day">{new Date(event.startDate).getDate()}</div>
                  <div className="date-month">{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div className="event-content">
                  <div className="event-category">
                    {event.category?.name || 'Event'}
                  </div>
                  <h4 className="event-title">{event.title}</h4>
                  <div className="event-location">
                    <i className="bi bi-geo-alt"></i>
                    {event.venue.name}
                  </div>
                </div>
                <div className="event-action">
                  <Button
                    as={Link}
                    to={`/events/${event._id}`}
                    className="btn-minimal btn-ripple btn-magnetic"
                  >
                    <i className="bi bi-arrow-right"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Button as={Link} to="/events" className="btn-primary-gradient btn-lg btn-pulse btn-magnetic btn-glow">
              <i className="bi bi-grid me-2"></i>
              View All Events
              <span className="btn-shine"></span>
            </Button>
          </div>
        </Container>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <Container>
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <div className="stat-box stat-1">
                <div className="stat-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number" data-target="500">0</div>
                  <div className="stat-label">Total Events</div>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="stat-box stat-2">
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number" data-target="10000">0</div>
                  <div className="stat-label">Active Students</div>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="stat-box stat-3">
                <div className="stat-icon">
                  <i className="bi bi-trophy"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number" data-target="150">0</div>
                  <div className="stat-label">Awards Won</div>
                </div>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="stat-box stat-4">
                <div className="stat-icon">
                  <i className="bi bi-star"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number" data-target="98">0</div>
                  <div className="stat-label">Satisfaction %</div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <div className="section-header text-center mb-5">
            <div className="section-badge">
              <span>💬 Testimonials</span>
            </div>
            <h2 className="section-title">
              What Students Say
            </h2>
            <p className="section-subtitle">
              Real experiences from our amazing campus community
            </p>
          </div>

          <Row>
            <Col lg={4} md={6} className="mb-4">
              <div className="testimonial-card testimonial-1">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    "This platform completely changed how I discover campus events.
                    I've made so many friends and memories!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face" alt="Sarah" />
                    </div>
                    <div className="author-info">
                      <div className="author-name">Sarah Johnson</div>
                      <div className="author-role">Computer Science Student</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="testimonial-card testimonial-2">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    "Amazing events, easy registration, and great community.
                    This is exactly what our campus needed!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Mike" />
                    </div>
                    <div className="author-info">
                      <div className="author-name">Mike Chen</div>
                      <div className="author-role">Business Student</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <div className="testimonial-card testimonial-3">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="testimonial-text">
                    "I love how organized everything is. Finding and joining
                    events has never been this simple and fun!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face" alt="Emma" />
                    </div>
                    <div className="author-info">
                      <div className="author-name">Emma Davis</div>
                      <div className="author-role">Art Student</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="newsletter-content">
                <h3 className="newsletter-title">
                  Stay Updated with Latest Events
                </h3>
                <p className="newsletter-description">
                  Get weekly updates about exciting campus events, workshops,
                  and activities delivered straight to your inbox.
                </p>
              </div>
            </Col>
            <Col lg={6}>
              <div className="newsletter-form">
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control newsletter-input"
                    placeholder="Enter your email address"
                  />
                  <Button className="btn-newsletter btn-ripple btn-magnetic btn-glow">
                    <i className="bi bi-send me-2"></i>
                    Subscribe
                    <span className="btn-shine"></span>
                  </Button>
                </div>
                <small className="newsletter-note">
                  <i className="bi bi-shield-check me-1"></i>
                  We respect your privacy. Unsubscribe anytime.
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      {!user && (
        <section className="cta-section-modern">
          <div className="cta-background">
            <div className="cta-particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
              <div className="particle particle-5"></div>
            </div>

            <Container>
              <div className="cta-content text-center">
                <div className="cta-icon">
                  <i className="bi bi-rocket-takeoff"></i>
                </div>
                <h2 className="cta-title">
                  Ready to Start Your
                  <span className="gradient-text"> Journey?</span>
                </h2>
                <p className="cta-description">
                  Join thousands of students discovering amazing events and building
                  incredible memories on campus every day.
                </p>

                <div className="cta-stats">
                  <div className="cta-stat">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Happy Students</div>
                  </div>
                  <div className="cta-stat">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Events Monthly</div>
                  </div>
                  <div className="cta-stat">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Universities</div>
                  </div>
                </div>

                <div className="cta-buttons">
                  <Button as={Link} to="/register" className="btn-primary-gradient btn-lg btn-pulse btn-magnetic btn-glow btn-3d">
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                    <span className="btn-shine"></span>
                  </Button>
                  <Button as={Link} to="/login" className="btn-glass btn-lg btn-ripple btn-magnetic btn-neon">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </section>
      )}

      {/* Footer Wave */}
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill"></path>
        </svg>
      </div>

      {/* Floating Action Button */}
      <Button
        as={Link}
        to="/events"
        className="btn-floating btn-ripple btn-pulse"
        title="Quick Access to Events"
      >
        <i className="bi bi-plus-lg"></i>
      </Button>

      {/* Back to Top Button */}
      <Button
        className="btn-floating btn-ripple"
        style={{
          bottom: '5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to Top"
      >
        <i className="bi bi-arrow-up"></i>
      </Button>
    </div>
  );
};

export default HomePage;
