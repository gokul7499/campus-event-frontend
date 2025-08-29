import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Pagination, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'startDate',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [filters, pagination.currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Only add non-empty filter values
      if (filters.search.trim()) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      queryParams.append('page', pagination.currentPage);
      queryParams.append('limit', pagination.itemsPerPage);

      console.log('Fetching events with URL:', `/api/events?${queryParams}`);
      const response = await axios.get(`/api/events?${queryParams}`);

      console.log('Events API Response:', response.data);

      setEvents(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: response.data.pagination?.currentPage || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        totalItems: response.data.pagination?.totalItems || 0
      }));
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(`Request error: ${error.message}`);
      }
      // Set empty state on error
      setEvents([]);
      setPagination(prev => ({
        ...prev,
        totalItems: 0,
        totalPages: 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await axios.get('/api/categories');
      console.log('Categories API Response:', response.data);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
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

  if (loading && events.length === 0) {
    return <LoadingSpinner fullScreen text="Loading events..." />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Campus Events</h1>
          <p className="text-muted">
            Discover and register for exciting events happening around campus
          </p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Search Events</Form.Label>
                    <Form.Control
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search by title, description..."
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                    >
                      <option value="startDate">Date</option>
                      <option value="title">Title</option>
                      <option value="createdAt">Recently Added</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label>Order</Form.Label>
                    <Form.Select
                      name="sortOrder"
                      value={filters.sortOrder}
                      onChange={handleFilterChange}
                    >
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Connection Error</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button onClick={fetchEvents} variant="outline-danger">
                  Try Again
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Results Summary */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {events.length} of {pagination.totalItems} events
          </p>
        </Col>
      </Row>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events.length === 0 ? (
        <Row>
          <Col className="text-center py-5">
            <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3 text-muted">No Events Found</h4>
            <p className="text-muted mb-4">
              {error ?
                'Unable to load events. Please check your connection and try again.' :
                'Try adjusting your search criteria or check back later for new events.'
              }
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={fetchEvents}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Events
              </Button>
              {(filters.search || filters.category || filters.startDate || filters.endDate) && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setFilters({
                      search: '',
                      category: '',
                      startDate: '',
                      endDate: '',
                      sortBy: 'startDate',
                      sortOrder: 'asc'
                    });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          {events.map((event) => (
            <Col lg={4} md={6} key={event._id} className="mb-4">
              <Card className="h-100 event-card">
                {event.images?.banner?.medium && (
                  <Card.Img 
                    variant="top" 
                    src={event.images.banner.medium} 
                    alt={event.title}
                    className="event-image"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Badge bg="primary" className="me-2">
                      {event.category?.name}
                    </Badge>
                    {event.isFeatured && (
                      <Badge bg="warning" text="dark">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <Card.Title className="h5">{event.title}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    {event.description.substring(0, 100)}...
                  </Card.Text>
                  <div className="event-details mb-3">
                    <small className="text-muted d-block">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(event.startDate)} at {formatTime(event.startDate)}
                    </small>
                    <small className="text-muted d-block">
                      <i className="bi bi-geo-alt me-1"></i>
                      {event.venue.name}
                    </small>
                    <small className="text-muted d-block">
                      <i className="bi bi-people me-1"></i>
                      {event.availableSpots} spots available
                    </small>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/events/${event._id}`} 
                    variant="primary"
                    className="mt-auto"
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First 
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                ) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === pagination.currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                } else if (
                  page === pagination.currentPage - 3 ||
                  page === pagination.currentPage + 3
                ) {
                  return <Pagination.Ellipsis key={page} />;
                }
                return null;
              })}
              
              <Pagination.Next 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
              <Pagination.Last 
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default EventsPage;
