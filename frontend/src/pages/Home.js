import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 mb-4">
                NIT Warangal
              </h1>
              <h2 className="h4 mb-4 text-light">
                Academic Certificates Platform
              </h2>
              <p className="lead mb-4">
                Secure, transparent, and immutable certificate verification 
                powered by Hyperledger Fabric blockchain technology.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button 
                  as={Link} 
                  to="/verify" 
                  variant="light" 
                  size="lg" 
                  className="me-md-2"
                >
                  <i className="fas fa-search me-2"></i>
                  Verify Certificate
                </Button>
                <Button 
                  as={Link} 
                  to="/certificates" 
                  variant="outline-light" 
                  size="lg"
                >
                  <i className="fas fa-list me-2"></i>
                  Browse Certificates
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2>Why Choose Our Platform?</h2>
            <p className="text-muted">
              Experience the power of blockchain for academic credential verification
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h4>Secure & Immutable</h4>
                <p>
                  Certificates are stored on Hyperledger Fabric blockchain, 
                  ensuring they cannot be tampered with or forged.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h4>Instant Verification</h4>
                <p>
                  Verify any certificate instantly with our blockchain-based 
                  verification system. No need to contact institutions.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="feature-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <h4>Transparent</h4>
                <p>
                  Full audit trail of all certificate transactions and modifications 
                  stored permanently on the blockchain.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={6}>
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="feature-icon">
                  <i className="fas fa-university"></i>
                </div>
                <h4>NIT Warangal Certificates</h4>
                <p>
                  All academic certificates issued by NIT Warangal are stored 
                  securely on the blockchain for instant verification.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="feature-icon">
                  <i className="fas fa-history"></i>
                </div>
                <h4>Complete History</h4>
                <p>
                  View the complete history of any certificate including 
                  issuance, modifications, and verification attempts.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <section className="bg-light py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3>Ready to Get Started?</h3>
              <p className="lead">
                Join the future of academic credential verification today.
              </p>
              <Button 
                as={Link} 
                to="/login" 
                variant="primary" 
                size="lg"
              >
                Get Started
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;