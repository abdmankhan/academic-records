import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Certificates from './pages/Certificates';
import CreateCertificate from './pages/CreateCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import BlockchainExplorer from './pages/BlockchainExplorer';
import Login from './pages/Login';
import StudentRegister from './pages/StudentRegister';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/certificates" 
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute requiredRole="university">
                    <CreateCertificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/verify" 
                element={
                  <ProtectedRoute>
                    <VerifyCertificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blockchain" 
                element={
                  <ProtectedRoute requiredRole="university">
                    <BlockchainExplorer />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<StudentRegister />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;