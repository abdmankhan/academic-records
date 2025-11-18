import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { certificateService } from '../services/api';

const BlockchainExplorer = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, recent: 0 });

  useEffect(() => {
    fetchCertificates();
    const interval = setInterval(fetchCertificates, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getAll();
      const certs = response.data.data || [];
      setCertificates(certs);
      setStats({
        total: certs.length,
        recent: certs.filter(c => {
          const created = new Date(c.createdAt || c.issuedAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return created > dayAgo;
        }).length
      });
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="fas fa-cube me-2"></i>
            Blockchain Explorer
          </h2>
          <p className="text-muted">
            Real-time view of certificates stored on Hyperledger Fabric blockchain
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <p className="mb-0">Total Certificates</p>
              <small className="text-muted">On Blockchain</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="text-success">{stats.recent}</h3>
              <p className="mb-0">Recent (24h)</p>
              <small className="text-muted">New Certificates</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body>
              <h3 className="text-info">3</h3>
              <p className="mb-0">Organizations</p>
              <small className="text-muted">Private Blockchain</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Blockchain Certificates
            </h5>
            <Badge bg="success" className="pulse">
              <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem' }}></i>
              LIVE
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading blockchain data...</p>
            </div>
          ) : certificates.length === 0 ? (
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              No certificates found on blockchain. Create one to see it appear here!
            </Alert>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Issued</th>
                    <th>Blockchain Key</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, index) => (
                    <tr key={index}>
                      <td>
                        <code>{cert.id || cert.blockchainKey}</code>
                      </td>
                      <td>{cert.studentName || 'N/A'}</td>
                      <td>{cert.course || cert.courseName || 'N/A'}</td>
                      <td>
                        <Badge bg={cert.grade === 'A' ? 'success' : 'primary'}>
                          {cert.grade || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        {cert.issuedAt || cert.createdAt
                          ? new Date(cert.issuedAt || cert.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <small className="text-muted">
                          {cert.blockchainKey ? (
                            <code className="small">{cert.blockchainKey.substring(0, 20)}...</code>
                          ) : (
                            'N/A'
                          )}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 p-3 bg-light rounded">
            <h6>
              <i className="fas fa-shield-alt me-2 text-success"></i>
              Blockchain Features Demonstrated:
            </h6>
            <ul className="mb-0">
              <li>
                <strong>Immutability:</strong> Once added, certificates cannot be deleted or altered
              </li>
              <li>
                <strong>Distributed:</strong> Data replicated across 6 peers in 3 organizations
              </li>
              <li>
                <strong>Transparent:</strong> All transactions are visible and auditable
              </li>
              <li>
                <strong>Private/Consortium:</strong> Only authorized organizations can participate
              </li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BlockchainExplorer;




