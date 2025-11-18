import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { certificateService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateCertificate = () => {
  const [formData, setFormData] = useState({
    id: '',
    studentId: '',
    studentName: '',
    course: '',
    grade: '',
    issuedAt: new Date().toISOString().split('T')[0]
  });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if not authenticated or not a university
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'university' && user?.role !== 'admin') {
      toast.error('Only universities can issue certificates');
      navigate('/');
    } else {
      // Fetch all students for dropdown
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await studentService.getAll();
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students list');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSelect = async (e) => {
    const rollNumber = e.target.value;
    if (!rollNumber) {
      // Reset form if no student selected
      setFormData({
        ...formData,
        studentId: '',
        studentName: '',
        course: ''
      });
      return;
    }

    try {
      // Fetch student details
      const response = await studentService.getByRollNumber(rollNumber);
      const student = response.data.data;
      
      // Auto-fill form with student details
      setFormData({
        ...formData,
        studentId: student.rollNumber,
        studentName: student.name,
        course: student.course
      });
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      toast.error('Failed to load student details');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CERT_${timestamp}_${random}`.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const certificateData = {
        ...formData,
        id: formData.id || generateCertificateId(),
        issuedAt: new Date(formData.issuedAt).toISOString()
      };

      await certificateService.create(certificateData);
      toast.success('Certificate created successfully!');
      navigate('/certificates');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create certificate';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Issue Certificate - NIT Warangal
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Certificate ID</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          name="id"
                          value={formData.id}
                          onChange={handleChange}
                          placeholder="Leave empty for auto-generation"
                        />
                        <Button
                          variant="outline-secondary"
                          type="button"
                          onClick={() => setFormData({...formData, id: generateCertificateId()})}
                        >
                          <i className="fas fa-sync-alt"></i>
                        </Button>
                      </div>
                      <Form.Text className="text-muted">
                        Leave empty to auto-generate a unique ID
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Student (Roll Number) *</Form.Label>
                      {loadingStudents ? (
                        <div className="d-flex align-items-center">
                          <Spinner size="sm" className="me-2" />
                          <span>Loading students...</span>
                        </div>
                      ) : (
                        <Form.Select
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleStudentSelect}
                          required
                        >
                          <option value="">-- Select Student --</option>
                          {students.map((student) => (
                            <option key={student.rollNumber} value={student.rollNumber}>
                              {student.rollNumber} - {student.name} ({student.course})
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <Form.Text className="text-muted">
                        Select a registered student from the dropdown
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        placeholder="Auto-filled when student selected"
                        required
                        readOnly={!!formData.studentId}
                        style={formData.studentId ? { backgroundColor: '#f8f9fa' } : {}}
                      />
                      <Form.Text className="text-muted">
                        {formData.studentId ? 'Auto-filled from student record' : 'Will be auto-filled when you select a student'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Course *</Form.Label>
                      <Form.Control
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="Auto-filled when student selected"
                        required
                        readOnly={!!formData.studentId}
                        style={formData.studentId ? { backgroundColor: '#f8f9fa' } : {}}
                      />
                      <Form.Text className="text-muted">
                        {formData.studentId ? 'Auto-filled from student record' : 'Will be auto-filled when you select a student'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grade *</Form.Label>
                      <Form.Select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Grade</option>
                        <option value="A">A - Excellent</option>
                        <option value="B">B - Good</option>
                        <option value="C">C - Satisfactory</option>
                        <option value="D">D - Pass</option>
                        <option value="F">F - Fail</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Issue Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="issuedAt"
                        value={formData.issuedAt}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/certificates')}
                    disabled={loading}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Creating Certificate...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-certificate me-2"></i>
                        Create Certificate
                      </>
                    )}
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

export default CreateCertificate;