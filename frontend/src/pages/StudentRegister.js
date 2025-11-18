import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentService } from '../services/api';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    course: '',
    passoutYear: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.rollNumber || !formData.name || !formData.course || !formData.passoutYear) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.passoutYear < 2000 || formData.passoutYear > 2100) {
      setError('Please enter a valid passout year (2000-2100)');
      setLoading(false);
      return;
    }

    try {
      const response = await studentService.register(formData);
      toast.success('Registration successful! Redirecting to login...');
      
      // Show login credentials
      setTimeout(() => {
        toast.info(
          `Your login credentials:\nUsername: ${response.data.loginInfo.username}\nPassword: ${response.data.loginInfo.password}`,
          { autoClose: 10000 }
        );
        navigate('/login');
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-user-graduate me-2"></i>
                Student Registration
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> Your roll number will be your username and password for login.
              </Alert>

              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Roll Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="Enter your roll number (e.g., 23MCF1R02)"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                  <Form.Text className="text-muted">
                    This will be your username and password for login
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Course *</Form.Label>
                  <Form.Control
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Enter your course (e.g., MCA, B.Tech)"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Passout Year *</Form.Label>
                  <Form.Control
                    type="number"
                    name="passoutYear"
                    value={formData.passoutYear}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    required
                  />
                  <Form.Text className="text-muted">
                    Year of graduation
                  </Form.Text>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already registered? <Link to="/login">Login here</Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentRegister;

