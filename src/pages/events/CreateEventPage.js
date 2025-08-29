import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    capacity: '',
    category: '',
    tags: [],
    registrationDeadline: '',
    isPublic: true,
    requiresApproval: false,
    isFeatured: false,
    price: {
      amount: 0,
      currency: 'USD',
      isFree: true
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    requirements: {
      ageLimit: {
        min: '',
        max: ''
      },
      prerequisites: [],
      equipment: [],
      documents: []
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Check authentication and authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please log in to create events');
        navigate('/login');
        return;
      }

      if (!hasRole(['organizer', 'admin'])) {
        toast.error('You need organizer or admin privileges to create events');
        navigate('/');
        return;
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  useEffect(() => {
    if (user && hasRole(['organizer', 'admin'])) {
      fetchCategories();
    }
  }, [user, hasRole]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      console.log('Categories API response:', response.data); // Debug log

      // Handle different response structures
      let categoriesData = [];
      if (response.data.success) {
        // Check if data is directly an array or nested
        if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.categories)) {
          categoriesData = response.data.data.categories;
        }
      }

      console.log('Parsed categories:', categoriesData); // Debug log
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePriceChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        amount,
        isFree: amount === 0
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.venue.name.trim()) newErrors.venueName = 'Venue name is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    if (!formData.category) newErrors.category = 'Category is required';

    // Title length validation
    if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (formData.title.trim().length > 200) newErrors.title = 'Title cannot exceed 200 characters';

    // Description length validation
    if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (formData.description.trim().length > 2000) newErrors.description = 'Description cannot exceed 2000 characters';

    // Capacity validation
    if (formData.capacity && (formData.capacity < 1 || formData.capacity > 10000)) {
      newErrors.capacity = 'Capacity must be between 1 and 10000';
    }

    // Date validations
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate <= now) {
        newErrors.startDate = 'Start date must be in the future';
      }
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.registrationDeadline && formData.startDate) {
      const regDeadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);

      if (regDeadline >= startDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event start';
      }
    }

    console.log('Validation errors:', newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure dates are in ISO format
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : undefined,
        // Ensure capacity is a number
        capacity: parseInt(formData.capacity),
        // Clean up empty fields
        contact: {
          email: formData.contact.email || undefined,
          phone: formData.contact.phone || undefined,
          website: formData.contact.website || undefined
        }
      };

      // Remove undefined fields
      if (!submitData.registrationDeadline) {
        delete submitData.registrationDeadline;
      }

      console.log('Submitting event data:', submitData); // Debug log

      const response = await axios.post('/api/events', submitData);

      if (response.data.success) {
        toast.success('Event created successfully!');
        navigate(`/events/${response.data.data.event._id}`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      console.error('Error response:', error.response?.data); // Debug log
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading || (categories.length === 0 && user && hasRole(['organizer', 'admin']))) {
    return <LoadingSpinner />;
  }

  // Don't render if user is not authenticated or authorized
  if (!user || !hasRole(['organizer', 'admin'])) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">Create New Event</h1>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <h5 className="mb-3">Basic Information</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Event Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    isInvalid={!!errors.title}
                    placeholder="Enter event title"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.description}
                    placeholder="Describe your event..."
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        isInvalid={!!errors.category}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Capacity *</Form.Label>
                      <Form.Control
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        isInvalid={!!errors.capacity}
                        min="1"
                        max="10000"
                        placeholder="Maximum attendees"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.capacity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Date and Time */}
                <h5 className="mb-3 mt-4">Date & Time</h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        isInvalid={!!errors.startDate}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.startDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date & Time *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        isInvalid={!!errors.endDate}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.endDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Registration Deadline</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    isInvalid={!!errors.registrationDeadline}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.registrationDeadline}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Leave empty for no deadline
                  </Form.Text>
                </Form.Group>

                {/* Venue Information */}
                <h5 className="mb-3 mt-4">Venue Information</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Venue Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="venue.name"
                    value={formData.venue.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.venueName}
                    placeholder="Enter venue name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.venueName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue.address.street"
                        value={formData.venue.address.street}
                        onChange={handleInputChange}
                        placeholder="Street address"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue.address.city"
                        value={formData.venue.address.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue.address.state"
                        value={formData.venue.address.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue.address.zipCode"
                        value={formData.venue.address.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue.address.country"
                        value={formData.venue.address.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Pricing */}
                <h5 className="mb-3 mt-4">Pricing</h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (USD)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price.amount}
                          onChange={handlePriceChange}
                          placeholder="0.00"
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Enter 0 for free events
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Type</Form.Label>
                      <div className="mt-2">
                        <Form.Check
                          type="switch"
                          id="is-free"
                          label={formData.price.isFree ? "Free Event" : "Paid Event"}
                          checked={formData.price.isFree}
                          readOnly
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Tags */}
                <h5 className="mb-3 mt-4">Tags</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Add Tags</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button variant="outline-secondary" onClick={addTag}>
                      Add
                    </Button>
                  </InputGroup>

                  {formData.tags.length > 0 && (
                    <div className="mt-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="badge bg-primary me-2 mb-2">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            style={{ fontSize: '0.7em' }}
                            onClick={() => removeTag(tag)}
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Contact Information */}
                <h5 className="mb-3 mt-4">Contact Information</h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contact.phone"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        placeholder="+1-555-0123"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>

                {/* Event Settings */}
                <h5 className="mb-3 mt-4">Event Settings</h5>

                <Row>
                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      id="is-public"
                      label="Public Event"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      id="requires-approval"
                      label="Requires Approval"
                      name="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={handleInputChange}
                      className="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      id="is-featured"
                      label="Featured Event"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="mb-3"
                    />
                  </Col>
                </Row>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateEventPage;
