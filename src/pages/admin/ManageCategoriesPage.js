import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
    icon: 'calendar',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/categories', formData);
        toast.success('Category created successfully');
      }
      
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await axios.delete(`/api/categories/${categoryToDelete._id}`);
      toast.success('Category deleted successfully');
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#007bff',
      icon: 'calendar',
      isActive: true,
      sortOrder: 0
    });
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await axios.put(`/api/categories/${categoryId}`, { isActive: !currentStatus });
      toast.success('Category status updated');
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category status:', error);
      toast.error('Failed to update category status');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Manage Categories</h1>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Category
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {categories.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No Categories Found</h4>
                  <p className="text-muted">Create your first category to get started.</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Create Category
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Events</th>
                      <th>Status</th>
                      <th>Sort Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-3 rounded"
                              style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: category.color
                              }}
                            ></div>
                            <div>
                              <h6 className="mb-0">{category.name}</h6>
                              <small className="text-muted">
                                <i className={`bi bi-${category.icon} me-1`}></i>
                                {category.slug}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">
                            {category.description || 'No description'}
                          </span>
                        </td>
                        <td>
                          <Badge bg="info">{category.eventCount || 0} events</Badge>
                        </td>
                        <td>
                          <Badge bg={category.isActive ? 'success' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{category.sortOrder}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant={category.isActive ? 'outline-warning' : 'outline-success'}
                              size="sm"
                              onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                            >
                              <i className={`bi bi-${category.isActive ? 'pause' : 'play'}`}></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setCategoryToDelete(category);
                                setShowDeleteModal(true);
                              }}
                              disabled={category.eventCount > 0}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Category Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter category name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon</Form.Label>
                  <Form.Select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    <option value="calendar">Calendar</option>
                    <option value="book">Book</option>
                    <option value="trophy">Trophy</option>
                    <option value="music-note">Music Note</option>
                    <option value="people">People</option>
                    <option value="palette">Palette</option>
                    <option value="briefcase">Briefcase</option>
                    <option value="heart">Heart</option>
                    <option value="tools">Tools</option>
                    <option value="code">Code</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is-active"
                label="Active Category"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the category "{categoryToDelete?.name}"?</p>
          <p className="text-danger">
            <strong>This action cannot be undone.</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageCategoriesPage;
