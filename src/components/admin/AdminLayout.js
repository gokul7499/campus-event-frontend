import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg={3} xl={2} className="mb-4">
          <AdminSidebar />
        </Col>
        <Col lg={9} xl={10}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
