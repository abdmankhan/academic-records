import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>
            <i className="fas fa-certificate me-2"></i>
            NIT Warangal
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            
            {/* Role-based navigation */}
            {isAuthenticated && user?.role === 'university' && (
              <LinkContainer to="/create">
                <Nav.Link>
                  <i className="fas fa-plus-circle me-1"></i>
                  Issue Certificate
                </Nav.Link>
              </LinkContainer>
            )}
            
            {/* Student can only see "My Certificates" (not Browse Certificates) */}
            {isAuthenticated && user?.role === 'student' && (
              <LinkContainer to="/certificates">
                <Nav.Link>
                  <i className="fas fa-graduation-cap me-1"></i>
                  My Certificates
                </Nav.Link>
              </LinkContainer>
            )}
            
            {/* Verify Certificate - Only for authenticated verifier, university, and admin */}
            {isAuthenticated && (user?.role === 'verifier' || user?.role === 'university' || user?.role === 'admin') && (
              <LinkContainer to="/verify">
                <Nav.Link>
                  <i className="fas fa-check-circle me-1"></i>
                  Verify Certificate
                </Nav.Link>
              </LinkContainer>
            )}
            
            {/* Browse Certificates - Only for university and admin (not for student/verifier) */}
            {isAuthenticated && (user?.role === 'university' || user?.role === 'admin') && (
              <LinkContainer to="/certificates">
                <Nav.Link>
                  <i className="fas fa-list me-1"></i>
                  Browse Certificates
                </Nav.Link>
              </LinkContainer>
            )}
            
            {/* Blockchain Explorer - Only for university and admin (not for student/verifier) */}
            {isAuthenticated && (user?.role === 'university' || user?.role === 'admin') && (
              <LinkContainer to="/blockchain">
                <Nav.Link>
                  <i className="fas fa-cube me-1"></i>
                  Blockchain Explorer
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <BootstrapNavbar.Text className="me-3">
                  <i className={`fas ${
                    user?.role === 'university' ? 'fa-university' :
                    user?.role === 'student' ? 'fa-user-graduate' :
                    user?.role === 'verifier' ? 'fa-building' :
                    'fa-user'
                  } me-1`}></i>
                  {user?.username} ({user?.role})
                </BootstrapNavbar.Text>
                <Button variant="outline-light" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <LinkContainer to="/login">
                <Button variant="outline-light" size="sm">
                  Login
                </Button>
              </LinkContainer>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;