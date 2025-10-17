"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText, Receipt, FileSpreadsheet } from "lucide-react";

interface PendingDocument {
  id: number;
  type: 'invoice' | 'quotation' | 'receipt' | 'checklist';
  invoice_number?: string;
  quotation_number?: string;
  receipt_number?: string;
  customer_name: string;
  total_amount?: number;
  created_by: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Fetching with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://127.0.0.1:5000/approvals/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setPendingDocuments(data.data);
      } else {
        console.error('API returned success: false', data);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doc: PendingDocument) => {
    if (!confirm(`Are you sure you want to approve this ${doc.type}?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://127.0.0.1:5000/approvals/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: doc.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPendingDocuments(prev => prev.filter(d => d.id !== doc.id));
        alert('Document approved successfully!');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://127.0.0.1:5000/approvals/reject', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          reason: rejectionReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPendingDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
        setRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedDoc(null);
        alert('Document rejected');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'quotation': return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'receipt': return <Receipt className="h-5 w-5 text-purple-600" />;
      case 'checklist': return <FileText className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentNumber = (doc: PendingDocument) => {
    return doc.invoice_number || doc.quotation_number || doc.receipt_number || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve documents submitted by your team</p>
      </div>

      {pendingDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No pending approvals at the moment</p>
          <p className="text-gray-500 text-sm mt-2">All documents have been reviewed</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg capitalize text-gray-900">{doc.type}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {getDocumentNumber(doc)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Customer:</span> {doc.customer_name}
                      </p>
                      {doc.total_amount && (
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Amount:</span> £{doc.total_amount.toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Created by {doc.created_by} on {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(doc)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setRejectDialogOpen(true);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-2">Reject Document</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this {selectedDoc?.type}
            </p>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                  setSelectedDoc(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}