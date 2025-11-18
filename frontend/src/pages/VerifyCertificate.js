import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { certificateService } from '../services/api';
import moment from 'moment';

const VerifyCertificate = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState(searchParams.get('id') || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerificationResult(null);

    try {
      // First, get the certificate
      const certResponse = await certificateService.getById(certificateId);
      setCertificate(certResponse.data.data);

      // Then verify it
      const verifyResponse = await certificateService.verify(certificateId, {});
      setVerificationResult(verifyResponse.data.data);
      
      toast.success('Certificate verification completed!');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Certificate not found or verification failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadgeVariant = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'success';
      case 'B': return 'primary';
      case 'C': return 'warning';
      case 'D': return 'secondary';
      case 'F': return 'danger';
      default: return 'info';
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Search Form */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-search me-2"></i>
                Certificate Verification
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-4">
                Enter a certificate ID to verify its authenticity on the blockchain.
              </p>

              <Form onSubmit={handleVerify}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Certificate ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        placeholder="Enter certificate ID (e.g., CERT1, CERT_123ABC)"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Label>&nbsp;</Form.Label>
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle me-2"></i>
                            Verify
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <Card className="mb-4">
              <Card.Header className={`text-white ${verificationResult.valid ? 'bg-success' : 'bg-danger'}`}>
                <h5 className="mb-0">
                  <i className={`fas ${verificationResult.valid ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
                  Verification {verificationResult.valid ? 'Successful' : 'Failed'}
                </h5>
              </Card.Header>
              <Card.Body>
                {verificationResult.valid ? (
                  <div className="alert alert-success mb-0">
                    <i className="fas fa-shield-alt me-2"></i>
                    This certificate is valid and authentic. It has been verified on the blockchain.
                  </div>
                ) : (
                  <div className="alert alert-danger mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    This certificate could not be verified. Reason: {verificationResult.reason || 'Invalid certificate'}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Certificate Details */}
          {certificate && (
            <Card className="certificate-card">
              <Card.Header className="certificate-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-certificate text-primary me-2"></i>
                    Certificate Details
                  </h5>
                  <Badge bg={getGradeBadgeVariant(certificate.grade)} className="status-badge">
                    Grade: {certificate.grade}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted small">CERTIFICATE ID</label>
                      <p className="h6">{certificate.id}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">STUDENT NAME</label>
                      <p className="h6">{certificate.studentName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">STUDENT ID</label>
                      <p className="h6">{certificate.studentId}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted small">COURSE</label>
                      <p className="h6">{certificate.course}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">GRADE ACHIEVED</label>
                      <p className="h6">
                        <Badge bg={getGradeBadgeVariant(certificate.grade)} className="fs-6">
                          {certificate.grade}
                        </Badge>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">ISSUE DATE</label>
                      <p className="h6">{moment(certificate.issuedAt).format('MMMM DD, YYYY')}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    This certificate is stored on Hyperledger Fabric blockchain
                  </small>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print me-2"></i>
                    Print Certificate
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-4">
            <Card.Body>
              <h6><i className="fas fa-question-circle text-info me-2"></i>How to Verify?</h6>
              <ul className="mb-0 small text-muted">
                <li>Enter the certificate ID in the field above</li>
                <li>Click "Verify" to check against the blockchain</li>
                <li>Valid certificates will show full details and verification status</li>
                <li>All data is retrieved directly from the Hyperledger Fabric network</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyCertificate;