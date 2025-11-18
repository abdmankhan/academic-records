import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={6}>
            <h5>NIT Warangal</h5>
            <p className="text-muted">
              Academic Certificates Platform - Blockchain-powered certificate verification system using Hyperledger Fabric.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="text-muted mb-0">
              © 2025 NIT Warangal. All rights reserved.
            </p>
            <p className="text-muted">
              Powered by <strong>Hyperledger Fabric</strong>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;