import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { certificateService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCertificates, setFilteredCertificates] = useState([]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      let response;
      
      // If user is a student, only fetch their certificates
      if (user?.role === 'student' && user?.studentId) {
        response = await certificateService.getByStudent(user.studentId);
      } else {
        response = await certificateService.getAll();
      }
      
      setCertificates(response.data.data || []);
      setError('');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to fetch certificates';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // Filter certificates based on search term
    if (searchTerm) {
      const filtered = certificates.filter(cert => 
        (cert.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.course || cert.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
  }, [searchTerm, certificates]);

  const getGradeBadgeVariant = (grade) => {
    if (!grade) return 'info';
    switch (grade.toUpperCase()) {
      case 'A': 
      case 'A+': return 'success';
      case 'B': 
      case 'B+': return 'primary';
      case 'C': 
      case 'C+': return 'warning';
      case 'D': 
      case 'D+': return 'secondary';
      case 'F': return 'danger';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading certificates...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                {user?.role === 'student' ? (
                  <>
                    <i className="fas fa-graduation-cap me-2"></i>
                    My Certificates
                  </>
                ) : (
                  <>
                    <i className="fas fa-certificate me-2"></i>
                    NIT Warangal Certificates
                  </>
                )}
              </h2>
              <p className="text-muted">
                {user?.role === 'student' 
                  ? 'View your issued certificates from NIT Warangal' 
                  : 'Browse all NIT Warangal certificates stored on the blockchain'}
              </p>
            </div>
            <Button variant="outline-primary" onClick={fetchCertificates}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by student name, course, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-md-end">
          <small className="text-muted">
            {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''} found
          </small>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Row>
        {filteredCertificates.length === 0 && !loading ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <i className="fas fa-certificate fa-3x text-muted mb-3"></i>
                <h4>No Certificates Found</h4>
                <p className="text-muted">
                  {searchTerm ? 'No certificates match your search criteria.' : 'No certificates have been issued yet.'}
                </p>
                {searchTerm && (
                  <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredCertificates.map((cert, index) => (
            <Col md={6} lg={4} key={cert.blockchainKey || cert.id || index} className="mb-4">
              <Card className="certificate-card h-100">
                <Card.Body>
                  <div className="certificate-header">
                    <h5 className="mb-2">
                      <i className="fas fa-certificate text-primary me-2"></i>
                      Certificate #{cert.blockchainKey || cert.id}
                    </h5>
                    <Badge bg={getGradeBadgeVariant(cert.grade || 'N/A')} className="status-badge">
                      Grade: {cert.grade || 'N/A'}
                    </Badge>
                  </div>

                  <div className="certificate-details">
                    <p className="mb-2">
                      <strong>Student:</strong><br />
                      {cert.studentName || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Student ID:</strong><br />
                      {cert.studentId || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <strong>Course:</strong><br />
                      {cert.course || cert.courseName || 'N/A'}
                    </p>
                    <p className="mb-0">
                      <strong>Issued:</strong><br />
                      <small className="text-muted">
                        {moment(cert.issuedAt || cert.issueDate).format('MMMM DD, YYYY')}
                      </small>
                    </p>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent">
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => window.open(`/verify?id=${cert.blockchainKey || cert.id}`, '_blank')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Verify Certificate
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Certificates;