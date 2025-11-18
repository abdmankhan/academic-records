import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { certificateService } from '../services/api';

const BlockchainInfo = ({ certificateId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificateId) {
      fetchHistory();
    }
  }, [certificateId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await certificateService.getHistory(certificateId);
      setHistory(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch blockchain history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!certificateId) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <h5>
            <i className="fas fa-link me-2"></i>
            Blockchain Information
          </h5>
          <p className="text-muted mb-0">
            Select a certificate to view its blockchain history
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-primary">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-link me-2"></i>
          Blockchain Transaction History
        </h5>
        <small>Certificate ID: {certificateId}</small>
      </Card.Header>
      <Card.Body>
        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading blockchain history...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!loading && !error && history.length === 0 && (
          <Alert variant="info">
            No transaction history found for this certificate
          </Alert>
        )}

        {!loading && history.length > 0 && (
          <div>
            <p className="text-muted mb-3">
              <strong>{history.length}</strong> transaction(s) recorded on blockchain
            </p>
            {history.map((tx, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Badge bg={tx.IsDelete === 'true' ? 'danger' : 'success'} className="me-2">
                      {tx.IsDelete === 'true' ? 'DELETE' : 'CREATE/UPDATE'}
                    </Badge>
                    <strong>Transaction #{index + 1}</strong>
                  </div>
                  <small className="text-muted">
                    {tx.Timestamp ? new Date(tx.Timestamp).toLocaleString() : 'N/A'}
                  </small>
                </div>
                <div className="small">
                  <div className="mb-1">
                    <strong>TxID:</strong> <code className="small">{tx.TxId || 'N/A'}</code>
                  </div>
                  {tx.Value && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <strong>Data:</strong>
                      <pre className="small mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(tx.Value, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            <strong>Blockchain Proof:</strong> This history is immutable and stored on Hyperledger Fabric blockchain.
            Every transaction is cryptographically linked and cannot be altered.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BlockchainInfo;




