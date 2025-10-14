"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ControlledCurrencyInput = ({ value, onChange, className, placeholder }: any) => {
    const [localValue, setLocalValue] = useState(value);
    
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleFocus = (e: any) => {
        if (localValue === "0.00") {
            setLocalValue('');
        } else {
            e.target.select();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        let cleanValue = newValue.replace(/[^0-9.]/g, '');
        const decimalCount = (cleanValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
            return;
        }
        setLocalValue(cleanValue);
        onChange(cleanValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let finalValue = e.target.value;
        let num = Number(finalValue);
        if (isNaN(num) || finalValue === '' || finalValue === '.') {
            num = 0;
        }
        const formatted = num.toFixed(2);
        setLocalValue(formatted);
        onChange(formatted);
    };
    
    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={className}
        />
    );
};

export default function ReceiptViewPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const today = new Date().toISOString().split('T')[0];

    const getParam = (key: string, defaultValue: string): string => {
        const value = searchParams.get(key);
        if (key === 'receiptDate' && value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            } catch (e) {
                // Fallback
            }
        }
        return value || defaultValue;
    };
    
    const customerId = getParam("customerId", "N/A");
    const customerName = getParam("customerName", ""); 
    const customerAddress = getParam("customerAddress", ""); 
    const customerPhone = getParam("customerPhone", ""); 
    const receiptType = getParam("type", "receipt");
    const paymentMethod = getParam("paymentMethod", "BACS");
    const paymentDescription = getParam("paymentDescription", "Payment received for your Kitchen/Bedroom Cabinetry.");

    const [paidAmount, setPaidAmount] = useState<string>(getParam("paidAmount", "0.00"));
    const [totalPaidToDate, setTotalPaidToDate] = useState<string>(getParam("totalPaidToDate", "0.00"));
    const [balanceToPay, setBalanceToPay] = useState<string>(getParam("balanceToPay", "0.00"));
    const [receiptDate, setReceiptDate] = useState<string>(getParam("receiptDate", today));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const displayDate = new Date(receiptDate).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    const getReceiptData = () => ({
        customerId,
        customerName,
        customerAddress,
        customerPhone,
        receiptType,
        receiptDate,
        paidAmount: Number(paidAmount),
        totalPaidToDate: Number(totalPaidToDate),
        balanceToPay: Number(balanceToPay),
        paymentMethod,
        paymentDescription,
    });

    const handleSave = async () => {
        setIsSubmitting(true);
        setSaveMessage("");
        
        const data = getReceiptData();

        try {
            const response = await fetch(`http://127.0.0.1:5000/receipts/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSaveMessage("✅ Receipt saved successfully!");
            } else {
                const errorData = await response.json().catch(() => ({ error: "Server error" }));
                setSaveMessage(`❌ Failed to save receipt: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Network error during save:", error);
            setSaveMessage("❌ Network error: Could not connect to the server.");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSaveMessage(""), 5000);
        }
    };

    const handleDownloadPdf = async () => {
        setSaveMessage("⌛ Generating PDF on server...");
        const data = getReceiptData();

        try {
            const response = await fetch(`http://127.0.0.1:5000/receipts/download-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const blob = await response.blob();
                const filename = `${receiptType.toUpperCase()}_Receipt_${customerName.replace(/\s/g, '_')}_${receiptDate.replace(/-/g, '')}.pdf`;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setSaveMessage("✅ PDF successfully generated and downloaded!");
            } else {
                const errorData = await response.json().catch(() => ({ error: "Server error" }));
                setSaveMessage(`❌ PDF generation failed: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Network error during PDF download:", error);
            setSaveMessage("❌ Network error: Could not connect to the server for PDF generation.");
        } finally {
            setTimeout(() => setSaveMessage(""), 5000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center no-print">
                <Button variant="outline" onClick={() => router.back()} className="text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex space-x-3">
                    <Button onClick={handleSave} disabled={isSubmitting} className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Receipt"}
                    </Button>
                    <Button variant="secondary" onClick={handleDownloadPdf} className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button onClick={handlePrint} className="flex items-center">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {saveMessage && (
                <div className={`mt-4 p-3 rounded-md text-sm font-medium ${
                    saveMessage.startsWith("✅") ? "bg-green-100 text-green-700" : 
                    saveMessage.startsWith("❌") ? "bg-red-100 text-red-700" : 
                    "bg-blue-100 text-blue-700"
                } no-print`}>
                    {saveMessage}
                </div>
            )}

            <Card className="shadow-xl print:shadow-none print:border print:border-black">
                <CardHeader className="bg-white p-6 border-b-4 border-white print:border-none">
                    <div className="flex justify-center w-full"> 
                        <div className="flex justify-start items-center space-x-4">
                            <div className="flex-shrink-0">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Aztec Interiors Logo" 
                                    className="h-16 w-auto" 
                                />
                            </div>
                            <div className="flex-grow text-left">
                                <h1 className="text-xl font-bold uppercase tracking-widest text-black">AZTEC INTERIORS</h1> 
                                <h2 className="text-lg font-semibold uppercase tracking-wider text-black">OFFICIAL RECEIPT</h2>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-10 print:p-6 space-y-8 print:space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-4 print:grid-cols-2 print:border-gray-900 print:pb-2">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-gray-900 print:hidden">Customer Details</h3>
                            <div className="text-black">
                                <p className="text-base print:text-sm">
                                    <span className="font-semibold w-16 inline-block">Name:</span> {customerName}
                                </p>
                                <p className="text-base print:text-sm">
                                    <span className="font-semibold w-16 inline-block">Address:</span> {customerAddress}
                                </p>
                                <p className="text-base print:text-sm">
                                    <span className="font-semibold w-16 inline-block">Phone:</span> {customerPhone}
                                </p>
                            </div>
                        </div>
                        <div className="text-right self-start flex flex-col items-end pt-8 print:pt-0">
                             <div className="flex items-center space-x-2 w-full max-w-[200px] print:justify-end">
                                <label htmlFor="receiptDate" className="text-base font-semibold flex-shrink-0 text-black print:hidden">Date:</label>
                                <span className="hidden print:inline-block text-base font-semibold text-black">{displayDate}</span>
                                <Input 
                                    id="receiptDate" 
                                    type="date" 
                                    value={receiptDate} 
                                    onChange={(e: any) => setReceiptDate(e.target.value)} 
                                    className="p-1 text-base text-right print:p-0 print:border-none print:text-black print:text-right print:bg-white print:hidden"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-lg font-medium text-black pt-4">
                        Confirmation of payment received by <strong>{paymentMethod}</strong> for {paymentDescription}
                    </div>
                    
                    <div className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50 print:bg-white print:border-transparent">
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-gray-800 flex-shrink-0">Paid:</p>
                            <div className="w-1/2 flex items-center space-x-1 justify-end">
                                <span className="text-xl font-bold text-gray-800">£</span>
                                <ControlledCurrencyInput
                                    value={paidAmount}
                                    onChange={setPaidAmount}
                                    className="text-xl font-bold text-gray-800 text-right p-1 border-none focus:ring-0 bg-transparent print:bg-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between items-center text-base font-semibold border-b border-gray-200 pb-2 print:text-black">
                            <span>Paid to date:</span> 
                            <div className="w-1/2 flex items-center space-x-1 justify-end">
                                <span className="flex-shrink-0">£</span>
                                <ControlledCurrencyInput
                                    value={totalPaidToDate}
                                    onChange={setTotalPaidToDate}
                                    className="text-right p-1 border-none focus:ring-0 bg-transparent print:bg-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-extrabold text-gray-900">
                            <span>Balance to Pay:</span> 
                            <div className="w-1/2 flex items-center space-x-1 justify-end">
                                <span className="flex-shrink-0">£</span>
                                <ControlledCurrencyInput
                                    value={balanceToPay}
                                    onChange={setBalanceToPay}
                                    className="text-lg font-extrabold text-gray-900 text-right p-1 border-none focus:ring-0 bg-transparent print:bg-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="pt-8 text-md font-medium text-black">Many Thanks</p>

                    <div className="flex justify-start items-center space-x-4 pt-4">
                        <p className="text-xl font-serif italic text-gray-800">Shahida Macci</p>
                    </div>
                </CardContent>

                <footer className="bg-gray-100 p-6 text-xs text-gray-600 border-t print:bg-white print:p-0 print:border-none print:mt-4">
                    <address className="not-italic text-center space-y-1">
                        <p className="font-bold text-black">Aztec Interiors (Leicester) Ltd</p>
                        <p>127b Barkby Road (Entrance on Lewisher Road)</p>
                        <p>Leicester LE4 9LG</p>
                        <p>Tel: 0116 2764516</p>
                        <p>Web: <a href="http://www.aztecinteriors.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.aztecinteriors.co.uk</a></p>
                        <p className="pt-2">Registered to England No. 5246691 | VAT Reg No. 846 8818 72</p>
                    </address>
                </footer>
            </Card>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}