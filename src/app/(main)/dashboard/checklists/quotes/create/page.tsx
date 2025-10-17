"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";

interface QuoteItem {
  id: string;
  item: string;
  description: string;
  colour: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const VAT_RATE = 0.20;

// Success Modal Component
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  onDownloadPdf, 
  onGoBack,
  isDownloading,
  approvalStatus
}: {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: () => void;
  onGoBack: () => void;
  isDownloading: boolean;
  approvalStatus: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quote Saved Successfully!
          </h3>
          
          {approvalStatus === 'pending' ? (
            <>
              <p className="text-gray-600 mb-4">
                Your quote has been saved and sent to the manager for approval.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4 text-left">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    PDF download will be available after manager approval.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-6">
              Would you like to download the quote as a PDF?
            </p>
          )}
          
          <div className="flex flex-col space-y-3">
            {approvalStatus === 'approved' && (
              <Button 
                onClick={onDownloadPdf}
                disabled={isDownloading}
                className="w-full"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={onGoBack}
              variant={approvalStatus === 'approved' ? 'outline' : 'default'}
              className="w-full"
            >
              {approvalStatus === 'approved' ? 'Go Back' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      item: '',
      description: '',
      colour: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  
  // Approval workflow state
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const customerAddress = searchParams.get('customerAddress');
    const customerPhone = searchParams.get('customerPhone');
    const customerEmail = searchParams.get('customerEmail');

    if (customerId && customerName) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: customerName || '',
        address: customerAddress || '',
        phone: customerPhone || '',
        email: customerEmail || '',
        notes: ''
      });
    }
  }, [searchParams]);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = subtotal * VAT_RATE;
  const total = subtotal + vatAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      item: '',
      description: '',
      colour: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const customerId = searchParams.get('customerId');
      if (!customerId) {
        throw new Error("Customer ID is required to save the quotation");
      }

      const quoteData = {
        customer_id: customerId,
        total: Number(total),
        notes: formData.notes,
        items: items.map(item => ({
          item: item.item,
          description: item.description,
          color: item.colour,
          amount: Number(item.amount)
        }))
      };

      const response = await fetch('http://127.0.0.1:5000/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to save quotation');
      }

      const result = await response.json();
      setSavedQuoteId(result.id);
      
      // Store submission ID and approval status if returned
      if (result.form_submission_id) {
        setSubmissionId(result.form_submission_id);
      }
      setApprovalStatus(result.approval_status || 'approved'); // Quotes might be auto-approved
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating quote:', error);
      setStatusMessage('❌ Failed to save quote. Please try again.');
      setTimeout(() => setStatusMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Check approval status before download
  const checkApprovalStatus = async () => {
    if (!submissionId) {
      // If no submission ID, quote might not require approval
      return true;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/approvals/status/${submissionId}`);
      const data = await response.json();
      
      setApprovalStatus(data.approval_status);
      setRejectionReason(data.rejection_reason || '');

      if (data.approval_status === 'rejected') {
        setStatusMessage(`❌ This quote was rejected. Reason: ${data.rejection_reason}`);
        return false;
      } else if (data.approval_status === 'pending') {
        setStatusMessage('⚠️ This quote is pending manager approval. You cannot download it yet.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking approval status:', error);
      // If check fails, allow download (might not require approval)
      return true;
    }
  };

  const handleDownloadPdf = async () => {
    // Check approval status first if there's a submission ID
    if (submissionId) {
      const canDownload = await checkApprovalStatus();
      if (!canDownload) {
        setTimeout(() => setStatusMessage(''), 5000);
        return;
      }
    }

    setIsDownloading(true);
    
    try {
      const pdfData = {
        date: formData.date,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        items: items.map(item => ({
          item: item.item,
          description: item.description,
          colour: item.colour,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        })),
        subtotal,
        vatAmount,
        total,
        quoteNumber: savedQuoteId ? `Q${savedQuoteId}` : `Q${Date.now()}`,
        submission_id: submissionId
      };

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${pdfData.quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoBack = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleGenerateQuote = () => {
    handleDownloadPdf();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDownloadPdf={handleDownloadPdf}
        onGoBack={handleGoBack}
        isDownloading={isDownloading}
        approvalStatus={approvalStatus}
      />

      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              onClick={() => router.back()}
              className="flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Create Quote</h1>
          </div>
        </div>
      </div>

      {/* Approval Status Badge */}
      {submissionId && (
        <div className="px-8 pt-6">
          <div className={`p-3 rounded-lg border-l-4 ${
            approvalStatus === 'approved' ? 'bg-green-50 border-green-500' :
            approvalStatus === 'rejected' ? 'bg-red-50 border-red-500' :
            'bg-yellow-50 border-yellow-500'
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`h-5 w-5 mr-2 ${
                approvalStatus === 'approved' ? 'text-green-600' :
                approvalStatus === 'rejected' ? 'text-red-600' :
                'text-yellow-600'
              }`} />
              <span className="font-medium">
                Status: <span className="capitalize">{approvalStatus}</span>
              </span>
            </div>
            {approvalStatus === 'rejected' && rejectionReason && (
              <p className="text-sm text-red-700 mt-1 ml-7">Reason: {rejectionReason}</p>
            )}
            {approvalStatus === 'pending' && (
              <p className="text-sm text-yellow-700 mt-1 ml-7">Waiting for manager approval before PDF download is available.</p>
            )}
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="px-8 pt-4">
          <div className={`p-3 rounded-md text-sm font-medium ${
            statusMessage.startsWith("✅") ? "bg-green-100 text-green-800" :
            statusMessage.startsWith("❌") ? "bg-red-100 text-red-800" :
            statusMessage.startsWith("⚠️") ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-200 text-gray-800"
          }`}>
            {statusMessage}
          </div>
        </div>
      )}

      <div className="px-8 py-6 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quote Items</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                      <Label>Item</Label>
                      <Input
                        value={item.item}
                        onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                        placeholder="Item name"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <Label>Colour</Label>
                      <Input
                        value={item.colour}
                        onChange={(e) => handleItemChange(item.id, 'colour', e.target.value)}
                        placeholder="Colour"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Unit Price (£)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Amount (£)</Label>
                      <Input
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (20%):</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateQuote}
              className="flex items-center space-x-2"
              disabled={!formData.name || items.some(item => !item.item)}
            >
              <FileText className="h-4 w-4" />
              <span>Generate Quote</span>
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Quote'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}