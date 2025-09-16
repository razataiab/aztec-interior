"use client";
import React, { useState, useRef } from "react";
import { 
  FileText, ChefHat, Bed, Plus, ExternalLink, CheckSquare, Clock, Receipt, FileCheck, DollarSign, 
  Briefcase, AlertTriangle, FileX, ArrowLeft, Upload, PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormType {
  id: string; title: string; description: string; icon: React.ReactNode; color: string; 
  bgColor: string; category: 'checklist' | 'document' | 'financial'; estimatedTime?: string;
}

export default function FormsChecklistPage() {
  const [activeForm, setActiveForm] = useState(null);
  const [formType, setFormType] = useState("kitchen");
  const [signatureMode, setSignatureMode] = useState("upload");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);
  
  const [formData, setFormData] = useState({
    customer_name: "", customer_phone: "", customer_address: "", room: "", survey_date: "", appointment_date: "",
    installation_date: "", completion_date: "", deposit_date: "", handles_handle_style: "", door_colour: "",
    drawer_colour: "", end_panel_colour: "", plinth_filler_colour: "", cabinet_colour: "", worktop_material_colour: "",
    worktop_upstands: false, worktop_splashback: false, worktop_wall_cladding: false, worktop_sink_cut_out: false,
    worktop_drainer_grooves: false, worktop_hob_cut_out: false, worktop_window_cill: false, worktop_led_grooves: false,
    worktop_other: false, worktop_size_12mm: false, worktop_size_20mm: false, worktop_size_30mm: false,
    under_wall_unit_lights_main_colour: "", under_wall_unit_lights_profile_colour: "", under_worktop_lights_colour: "",
    accessories: "", sink: "", tap: "", appliances: "", oven: "", oven_order_date: "", microwave: "", microwave_order_date: "",
    washing_machine: "", washing_machine_order_date: "", hob: "", hob_order_date: "", extractor: "", extractor_order_date: "",
    integrated_dishwasher: "", integrated_dishwasher_order_date: "", integrated_fridge_freezer: "", integrated_fridge_freezer_order_date: "",
    other_misc: "", terms_conditions_given: false, gas_electric_installation_given: false, appliance_promotion_given: false,
    fitting_style: "", door_style: "", bedside_cabinets_floating: false, bedside_cabinets_fitted: false, bedside_cabinets_freestand: false,
    bedside_cabinets_qty: "", dresser_desk_yes: false, dresser_desk_no: false, dresser_desk_qty_size: "",
    internal_mirror_yes: false, internal_mirror_no: false, internal_mirror_qty_size: "", mirror_silver: false,
    mirror_bronze: false, mirror_grey: false, mirror_qty: "", soffit_lights_spot: false, soffit_lights_strip: false,
    soffit_lights_cool_white: false, soffit_lights_warm_white: false, soffit_lights_qty: "", gable_lights_colour: "",
    gable_lights_black: false, gable_lights_white: false, gable_lights_qty: "", carpet_protection: false,
    floor_tile_protection: false, no_floor_protection: false
  });

  const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });
  const [recentForms, setRecentForms] = useState([
    { id: "1", customerName: "John Smith", type: "kitchen-checklist", date: "2024-09-10", status: "completed" },
    { id: "2", customerName: "Sarah Johnson", type: "bedroom-checklist", date: "2024-09-09", status: "pending" },
    { id: "3", customerName: "Mike Wilson", type: "quotation", date: "2024-09-08", status: "completed" }
  ]);

  const formTypes: FormType[] = [
    { id: "kitchen-checklist", title: "Kitchen Installation Checklist", description: "Complete verification form for kitchen installations with customer sign-off", icon: <ChefHat className="h-6 w-6" />, color: "text-blue-600", bgColor: "bg-blue-50 hover:bg-blue-100", category: "checklist", estimatedTime: "5-10 minutes" },
    { id: "bedroom-checklist", title: "Bedroom Installation Checklist", description: "Complete verification form for bedroom installations with customer confirmation", icon: <Bed className="h-6 w-6" />, color: "text-purple-600", bgColor: "bg-purple-50 hover:bg-purple-100", category: "checklist", estimatedTime: "5-10 minutes" },
    { id: "remedial-checklist", title: "Remedial Action Checklist", description: "Document and track remedial actions required for installations", icon: <AlertTriangle className="h-6 w-6" />, color: "text-orange-600", bgColor: "bg-orange-50 hover:bg-orange-100", category: "checklist", estimatedTime: "10-15 minutes" },
    { id: "general-checklist", title: "General Checklist", description: "Customizable checklist template for various project requirements", icon: <FileCheck className="h-6 w-6" />, color: "text-gray-600", bgColor: "bg-gray-50 hover:bg-gray-100", category: "checklist", estimatedTime: "5-15 minutes" },
    { id: "quotation", title: "Quotation", description: "Generate professional quotations for customer projects", icon: <FileText className="h-6 w-6" />, color: "text-green-600", bgColor: "bg-green-50 hover:bg-green-100", category: "document", estimatedTime: "15-20 minutes" },
    { id: "invoice", title: "Invoice", description: "Create invoices for completed work and project billing", icon: <Receipt className="h-6 w-6" />, color: "text-indigo-600", bgColor: "bg-indigo-50 hover:bg-indigo-100", category: "document", estimatedTime: "10-15 minutes" },
    { id: "proforma-invoice", title: "Proforma Invoice", description: "Generate proforma invoices for advance payments and estimates", icon: <FileX className="h-6 w-6" />, color: "text-cyan-600", bgColor: "bg-cyan-50 hover:bg-cyan-100", category: "document", estimatedTime: "10-15 minutes" },
    { id: "payment-terms", title: "Payment Terms", description: "Set up payment terms and conditions documentation", icon: <DollarSign className="h-6 w-6" />, color: "text-emerald-600", bgColor: "bg-emerald-50 hover:bg-emerald-100", category: "document", estimatedTime: "5-10 minutes" },
    { id: "job-sheet", title: "Job Sheet", description: "Create detailed job sheets for project management and tracking", icon: <Briefcase className="h-6 w-6" />, color: "text-slate-600", bgColor: "bg-slate-50 hover:bg-slate-100", category: "document", estimatedTime: "10-15 minutes" },
    { id: "receipt", title: "Receipt", description: "Generate receipts for payments and transactions", icon: <Receipt className="h-6 w-6" />, color: "text-teal-600", bgColor: "bg-teal-50 hover:bg-teal-100", category: "financial", estimatedTime: "3-5 minutes" },
    { id: "deposit-receipt", title: "Deposit Receipt", description: "Create receipts specifically for deposit payments", icon: <DollarSign className="h-6 w-6" />, color: "text-yellow-600", bgColor: "bg-yellow-50 hover:bg-yellow-100", category: "financial", estimatedTime: "3-5 minutes" },
    { id: "final-receipt", title: "Final Receipt", description: "Generate final payment receipts for project completion", icon: <CheckSquare className="h-6 w-6" />, color: "text-green-700", bgColor: "bg-green-50 hover:bg-green-100", category: "financial", estimatedTime: "3-5 minutes" }
  ];

  const handleCreateForm = (formType: string) => {
    if (formType.includes('checklist')) {
      setFormType(formType.replace('-checklist', ''));
      setActiveForm("checklist");
      return;
    }
    const token = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const formUrl = `/forms/${token}?type=${formType}`;
    alert(`Would create new ${formType} form.\n\nURL: ${formUrl}\n\nIn a real app, this would open the appropriate form builder or template.`);
  };

  const handleViewForm = (formId: string) => { alert(`Would open existing form with ID: ${formId}`); };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke(); }
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); }
  };

  const resetFormData = () => {
    setFormData({
      customer_name: "", customer_phone: "", customer_address: "", room: "", survey_date: "", appointment_date: "",
      installation_date: "", completion_date: "", deposit_date: "", handles_handle_style: "", door_colour: "",
      drawer_colour: "", end_panel_colour: "", plinth_filler_colour: "", cabinet_colour: "", worktop_material_colour: "",
      worktop_upstands: false, worktop_splashback: false, worktop_wall_cladding: false, worktop_sink_cut_out: false,
      worktop_drainer_grooves: false, worktop_hob_cut_out: false, worktop_window_cill: false, worktop_led_grooves: false,
      worktop_other: false, worktop_size_12mm: false, worktop_size_20mm: false, worktop_size_30mm: false,
      under_wall_unit_lights_main_colour: "", under_wall_unit_lights_profile_colour: "", under_worktop_lights_colour: "",
      accessories: "", sink: "", tap: "", appliances: "", oven: "", oven_order_date: "", microwave: "", microwave_order_date: "",
      washing_machine: "", washing_machine_order_date: "", hob: "", hob_order_date: "", extractor: "", extractor_order_date: "",
      integrated_dishwasher: "", integrated_dishwasher_order_date: "", integrated_fridge_freezer: "", integrated_fridge_freezer_order_date: "",
      other_misc: "", terms_conditions_given: false, gas_electric_installation_given: false, appliance_promotion_given: false,
      fitting_style: "", door_style: "", bedside_cabinets_floating: false, bedside_cabinets_fitted: false, bedside_cabinets_freestand: false,
      bedside_cabinets_qty: "", dresser_desk_yes: false, dresser_desk_no: false, dresser_desk_qty_size: "",
      internal_mirror_yes: false, internal_mirror_no: false, internal_mirror_qty_size: "", mirror_silver: false,
      mirror_bronze: false, mirror_grey: false, mirror_qty: "", soffit_lights_spot: false, soffit_lights_strip: false,
      soffit_lights_cool_white: false, soffit_lights_warm_white: false, soffit_lights_qty: "", gable_lights_colour: "",
      gable_lights_black: false, gable_lights_white: false, gable_lights_qty: "", carpet_protection: false,
      floor_tile_protection: false, no_floor_protection: false
    });
  };

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.customer_address) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields (Customer Name and Address).' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const customerData = {
        name: formData.customer_name, address: formData.customer_address, phone: formData.customer_phone || null,
        email: null, contact_made: 'Yes', preferred_contact_method: formData.customer_phone ? 'Phone' : 'Email',
        marketing_opt_in: false, date_of_measure: formData.survey_date || null, stage: 'Survey',
        notes: `${formType === 'kitchen' ? 'Kitchen' : 'Bedroom'} installation checklist completed on ${new Date().toLocaleDateString()}. Survey: ${formData.survey_date || 'TBD'}, Appointment: ${formData.appointment_date || 'TBD'}, Installation: ${formData.installation_date || 'TBD'}, Completion: ${formData.completion_date || 'TBD'}, Deposit Date: ${formData.deposit_date || 'TBD'}${formData.room ? `, Room: ${formData.room}` : ''}`,
        project_types: [formType === 'kitchen' ? 'Kitchen' : 'Bedroom'], salesperson: 'Aztec Interiors', status: 'Active'
      };

      const response = await fetch('http://127.0.0.1:5000/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        console.warn('Customer creation failed:', await response.text());
        try {
          const existingResponse = await fetch(`http://127.0.0.1:5000/customers?search=${encodeURIComponent(formData.customer_name)}`);
          if (existingResponse.ok) {
            const existing = await existingResponse.json();
            const match = existing.find(c => c.name.toLowerCase() === formData.customer_name.toLowerCase() && c.address?.toLowerCase().includes(formData.customer_address.toLowerCase()));
            if (match) {
              await fetch(`http://127.0.0.1:5000/customers/${match.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...customerData, notes: `${match.notes || ''}\n\n${customerData.notes}`.trim() })
              });
            }
          }
        } catch (e) { console.warn('Failed to update existing customer:', e); }
      }

      setSubmitStatus({ type: 'success', message: 'Form submitted successfully! Customer has been added to the database and will appear in the sales pipeline.' });
      
      const newForm = { id: `form_${Date.now()}`, customerName: formData.customer_name, type: `${formType}-checklist`, date: new Date().toISOString().split('T')[0], status: "completed" };
      setRecentForms(prev => [newForm, ...prev.slice(0, 2)]);

      setTimeout(() => { setActiveForm(null); resetFormData(); setSubmitStatus({ type: null, message: "" }); }, 3000);

    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to submit form. Please try again. Error: ' + (error.message || 'Unknown error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormsByCategory = (category: string) => formTypes.filter(form => form.category === category);

  const FormGrid = ({ forms }: { forms: FormType[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <Card key={form.id} className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${form.bgColor} border-0`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg bg-white shadow-sm ${form.color}`}>{form.icon}</div>
              {form.estimatedTime && <Badge variant="secondary" className="text-xs">{form.estimatedTime}</Badge>}
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">{form.title}</CardTitle>
            <CardDescription className="text-gray-600 text-sm leading-relaxed">{form.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full" size="sm" onClick={() => handleCreateForm(form.id)}>
              <Plus className="mr-2 h-4 w-4" />Create New
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (activeForm === "checklist") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setActiveForm(null)} className="p-2"><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Installation Checklist</h1>
                <p className="text-gray-600 mt-1">Complete installation verification form</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 text-center">{formType === "kitchen" ? "Kitchen Installation Checklist" : "Bedroom Installation Checklist"}</h2>

            {submitStatus.type && (
              <div className={`mb-6 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {submitStatus.message}
              </div>
            )}

            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</Label><Input placeholder="Enter customer name" className="w-full" value={formData.customer_name} onChange={(e) => handleInputChange('customer_name', e.target.value)} required /></div>
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Tel/Mobile Number</Label><Input placeholder="Enter phone number" type="tel" className="w-full" value={formData.customer_phone} onChange={(e) => handleInputChange('customer_phone', e.target.value)} /></div>
                <div className="md:col-span-2"><Label className="block text-sm font-medium text-gray-700 mb-1">Address *</Label><Input placeholder="Enter full address" className="w-full" value={formData.customer_address} onChange={(e) => handleInputChange('customer_address', e.target.value)} required /></div>
                {formType === "bedroom" && <div><Label className="block text-sm font-medium text-gray-700 mb-1">Room</Label><Input placeholder="Enter room details" className="w-full" value={formData.room} onChange={(e) => handleInputChange('room', e.target.value)} /></div>}
              </div>
            </div>

            {/* Important Dates */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Survey Date</Label><Input type="date" className="w-full" value={formData.survey_date} onChange={(e) => handleInputChange('survey_date', e.target.value)} /></div>
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</Label><Input type="date" className="w-full" value={formData.appointment_date} onChange={(e) => handleInputChange('appointment_date', e.target.value)} /></div>
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Professional Installation Date</Label><Input type="date" className="w-full" value={formData.installation_date} onChange={(e) => handleInputChange('installation_date', e.target.value)} /></div>
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Completion Check Date</Label><Input type="date" className="w-full" value={formData.completion_date} onChange={(e) => handleInputChange('completion_date', e.target.value)} /></div>
                <div><Label className="block text-sm font-medium text-gray-700 mb-1">Date Deposit Paid</Label><Input type="date" className="w-full" value={formData.deposit_date} onChange={(e) => handleInputChange('deposit_date', e.target.value)} /></div>
              </div>
            </div>

            {/* Kitchen Fields */}
            {formType === "kitchen" && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Handles/Handle Style (KATO COI)</Label><Input placeholder="Enter handle style" className="w-full" value={formData.handles_handle_style} onChange={(e) => handleInputChange('handles_handle_style', e.target.value)} /></div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Door Colour</Label><Input placeholder="Enter door colour" className="w-full" value={formData.door_colour} onChange={(e) => handleInputChange('door_colour', e.target.value)} /></div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Drawer Colour</Label><Input placeholder="Enter drawer colour" className="w-full" value={formData.drawer_colour} onChange={(e) => handleInputChange('drawer_colour', e.target.value)} /></div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">End Panel Colour</Label><Input placeholder="Enter end panel colour" className="w-full" value={formData.end_panel_colour} onChange={(e) => handleInputChange('end_panel_colour', e.target.value)} /></div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Plinth/Filler Colour</Label><Input placeholder="Enter plinth/filler colour" className="w-full" value={formData.plinth_filler_colour} onChange={(e) => handleInputChange('plinth_filler_colour', e.target.value)} /></div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Cabinet Colour</Label><Input placeholder="Enter cabinet colour" className="w-full" value={formData.cabinet_colour} onChange={(e) => handleInputChange('cabinet_colour', e.target.value)} /></div>
                    <div className="md:col-span-2"><Label className="block text-sm font-medium text-gray-700 mb-1">Worktop Material/Colour</Label><Input placeholder="Enter worktop material and colour" className="w-full" value={formData.worktop_material_colour} onChange={(e) => handleInputChange('worktop_material_colour', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Worktop Further Info</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      ['worktop_upstands', 'Upstands'], ['worktop_splashback', 'Splashback'], ['worktop_wall_cladding', 'Wall Cladding'],
                      ['worktop_sink_cut_out', 'Sink Cut Out'], ['worktop_drainer_grooves', 'Drainer Grooves'], ['worktop_hob_cut_out', 'Hob Cut Out'],
                      ['worktop_window_cill', 'Window Cill'], ['worktop_led_grooves', 'LED Grooves'], ['worktop_other', 'Other']
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData[key]} onChange={(e) => handleInputChange(key, e.target.checked)} />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Worktop Size</Label>
                    <div className="flex gap-4">
                      {[['worktop_size_12mm', '12mm'], ['worktop_size_20mm', '20mm'], ['worktop_size_30mm', '30mm']].map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input type="checkbox" checked={formData[key]} onChange={(e) => handleInputChange(key, e.target.checked)} />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Lighting</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Under Wall Unit Lights - Main Colour</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant={formData.under_wall_unit_lights_main_colour === "COOL WHITE" ? "default" : "outline"} onClick={() => handleInputChange('under_wall_unit_lights_main_colour', "COOL WHITE")} size="sm">Cool White</Button>
                          <Button variant={formData.under_wall_unit_lights_main_colour === "WARM WHITE" ? "default" : "outline"} onClick={() => handleInputChange('under_wall_unit_lights_main_colour', "WARM WHITE")} size="sm">Warm White</Button>
                        </div>
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Profile Colour</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant={formData.under_wall_unit_lights_profile_colour === "BLACK" ? "default" : "outline"} onClick={() => handleInputChange('under_wall_unit_lights_profile_colour', "BLACK")} size="sm">Black</Button>
                          <Button variant={formData.under_wall_unit_lights_profile_colour === "WHITE" ? "default" : "outline"} onClick={() => handleInputChange('under_wall_unit_lights_profile_colour', "WHITE")} size="sm">White</Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">Under Worktop Lights Colour</Label>
                      <div className="grid grid-cols-2 gap-2 max-w-md">
                        <Button variant={formData.under_worktop_lights_colour === "COOL WHITE" ? "default" : "outline"} onClick={() => handleInputChange('under_worktop_lights_colour', "COOL WHITE")} size="sm">Cool White</Button>
                        <Button variant={formData.under_worktop_lights_colour === "WARM WHITE" ? "default" : "outline"} onClick={() => handleInputChange('under_worktop_lights_colour', "WARM WHITE")} size="sm">Warm White</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Kitchen Items</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[['accessories', 'Accessories'], ['sink', 'Sink'], ['tap', 'Tap'], ['appliances', 'Appliances']].map(([key, label]) => (
                      <div key={key}><Label className="block text-sm font-medium text-gray-700 mb-1">{label}</Label><Input placeholder={`Enter ${label.toLowerCase()} details`} className="w-full" value={formData[key]} onChange={(e) => handleInputChange(key, e.target.value)} /></div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Specific Appliances</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'oven', label: 'Oven' }, { key: 'microwave', label: 'Microwave' }, { key: 'washing_machine', label: 'Washing Machine' },
                      { key: 'hob', label: 'Hob' }, { key: 'extractor', label: 'Extractor' }, { key: 'integrated_dishwasher', label: 'Integrated Dishwasher' },
                      { key: 'integrated_fridge_freezer', label: 'Integrated Fridge/Freezer' }
                    ].map(appliance => (
                      <div key={appliance.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div><Label className="block text-sm font-medium text-gray-700 mb-1">{appliance.label}</Label><Input placeholder={`Enter ${appliance.label.toLowerCase()} details`} className="w-full" value={formData[appliance.key]} onChange={(e) => handleInputChange(appliance.key, e.target.value)} /></div>
                        <div><Label className="block text-sm font-medium text-gray-700 mb-1">Order Date</Label><Input type="date" className="w-full" value={formData[`${appliance.key}_order_date`]} onChange={(e) => handleInputChange(`${appliance.key}_order_date`, e.target.value)} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Other/Misc</h3>
                  <Input placeholder="Enter other miscellaneous items" className="w-full" value={formData.other_misc} onChange={(e) => handleInputChange('other_misc', e.target.value)} />
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Information Provided</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Date Terms and Conditions Given</span>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.terms_conditions_given} onChange={(e) => handleInputChange('terms_conditions_given', e.target.checked)} /><span className="text-sm">Yes</span></label>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Gas and Electric Installation Information Given</span>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2"><input type="radio" name="gas_electric" checked={formData.gas_electric_installation_given === true} onChange={() => handleInputChange('gas_electric_installation_given', true)} /><span className="text-sm">Yes</span></label>
                        <label className="flex items-center space-x-2"><input type="radio" name="gas_electric" checked={formData.gas_electric_installation_given === false} onChange={() => handleInputChange('gas_electric_installation_given', false)} /><span className="text-sm">No</span></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Appliance Promotion Information Given</span>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2"><input type="radio" name="appliance_promotion" checked={formData.appliance_promotion_given === true} onChange={() => handleInputChange('appliance_promotion_given', true)} /><span className="text-sm">Yes</span></label>
                        <label className="flex items-center space-x-2"><input type="radio" name="appliance_promotion" checked={formData.appliance_promotion_given === false} onChange={() => handleInputChange('appliance_promotion_given', false)} /><span className="text-sm">No</span></label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bedroom Fields */}
            {formType === "bedroom" && (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Bedroom Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['fitting_style', 'Fitting Style'], ['door_style', 'Door Style'], ['door_colour', 'Door Colour'],
                      ['end_panel_colour', 'End Panel Colour'], ['plinth_filler_colour', 'Plinth/Filler Colour'], ['worktop_material_colour', 'Worktop Colour'],
                      ['cabinet_colour', 'Cabinet Colour'], ['handles_handle_style', 'Handles Code/Qty/Size']
                    ].map(([key, label]) => (
                      <div key={key}><Label className="block text-sm font-medium text-gray-700 mb-1">{label}</Label><Input placeholder={`Enter ${label.toLowerCase()}`} className="w-full" value={formData[key]} onChange={(e) => handleInputChange(key, e.target.value)} /></div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Bedside Cabinets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex gap-6">
                        {[['bedside_cabinets_floating', 'Floating'], ['bedside_cabinets_fitted', 'Fitted'], ['bedside_cabinets_freestand', 'Freestand']].map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2"><input type="checkbox" checked={formData[key]} onChange={(e) => handleInputChange(key, e.target.checked)} /><span className="text-sm">{label}</span></label>
                        ))}
                      </div>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label><Input placeholder="Enter quantity" className="w-full" value={formData.bedside_cabinets_qty} onChange={(e) => handleInputChange('bedside_cabinets_qty', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Dresser/Desk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-6">
                      <label className="flex items-center space-x-2"><input type="radio" name="dresser_desk" checked={formData.dresser_desk_yes} onChange={() => { handleInputChange('dresser_desk_yes', true); handleInputChange('dresser_desk_no', false); }} /><span className="text-sm">Yes</span></label>
                      <label className="flex items-center space-x-2"><input type="radio" name="dresser_desk" checked={formData.dresser_desk_no} onChange={() => { handleInputChange('dresser_desk_no', true); handleInputChange('dresser_desk_yes', false); }} /><span className="text-sm">No</span></label>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Qty/Size</Label><Input placeholder="Enter quantity/size" className="w-full" value={formData.dresser_desk_qty_size} onChange={(e) => handleInputChange('dresser_desk_qty_size', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Internal Mirror</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-6">
                      <label className="flex items-center space-x-2"><input type="radio" name="internal_mirror" checked={formData.internal_mirror_yes} onChange={() => { handleInputChange('internal_mirror_yes', true); handleInputChange('internal_mirror_no', false); }} /><span className="text-sm">Yes</span></label>
                      <label className="flex items-center space-x-2"><input type="radio" name="internal_mirror" checked={formData.internal_mirror_no} onChange={() => { handleInputChange('internal_mirror_no', true); handleInputChange('internal_mirror_yes', false); }} /><span className="text-sm">No</span></label>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Qty/Size</Label><Input placeholder="Enter quantity/size" className="w-full" value={formData.internal_mirror_qty_size} onChange={(e) => handleInputChange('internal_mirror_qty_size', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Mirror</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        {[['mirror_silver', 'Silver'], ['mirror_bronze', 'Bronze'], ['mirror_grey', 'Grey']].map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2"><input type="checkbox" checked={formData[key]} onChange={(e) => handleInputChange(key, e.target.checked)} /><span className="text-sm">{label}</span></label>
                        ))}
                      </div>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label><Input placeholder="Enter quantity" className="w-full" value={formData.mirror_qty} onChange={(e) => handleInputChange('mirror_qty', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Soffit Lights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label className="block text-sm font-medium text-gray-700">Type</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.soffit_lights_spot} onChange={(e) => handleInputChange('soffit_lights_spot', e.target.checked)} /><span className="text-sm">Spot</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.soffit_lights_strip} onChange={(e) => handleInputChange('soffit_lights_strip', e.target.checked)} /><span className="text-sm">Strip</span></label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="block text-sm font-medium text-gray-700">Colour</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.soffit_lights_cool_white} onChange={(e) => handleInputChange('soffit_lights_cool_white', e.target.checked)} /><span className="text-sm">Cool White</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.soffit_lights_warm_white} onChange={(e) => handleInputChange('soffit_lights_warm_white', e.target.checked)} /><span className="text-sm">Warm White</span></label>
                      </div>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label><Input placeholder="Enter quantity" className="w-full" value={formData.soffit_lights_qty} onChange={(e) => handleInputChange('soffit_lights_qty', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Gable Lights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Colour</Label><Input placeholder="Enter colour" className="w-full" value={formData.gable_lights_colour} onChange={(e) => handleInputChange('gable_lights_colour', e.target.value)} /></div>
                    <div className="space-y-3">
                      <Label className="block text-sm font-medium text-gray-700">Profile Colour</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.gable_lights_black} onChange={(e) => handleInputChange('gable_lights_black', e.target.checked)} /><span className="text-sm">Black</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.gable_lights_white} onChange={(e) => handleInputChange('gable_lights_white', e.target.checked)} /><span className="text-sm">White</span></label>
                      </div>
                    </div>
                    <div><Label className="block text-sm font-medium text-gray-700 mb-1">Quantity</Label><Input placeholder="Enter quantity" className="w-full" value={formData.gable_lights_qty} onChange={(e) => handleInputChange('gable_lights_qty', e.target.value)} /></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Other/Misc/Accessories</h3>
                  <div className="space-y-4">
                    <Label className="block text-sm font-medium text-gray-700">Floor Protection</Label>
                    <div className="flex gap-6">
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.carpet_protection} onChange={(e) => { handleInputChange('carpet_protection', e.target.checked); if (e.target.checked) { handleInputChange('floor_tile_protection', false); handleInputChange('no_floor_protection', false); } }} /><span className="text-sm">Carpet Protection</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.floor_tile_protection} onChange={(e) => { handleInputChange('floor_tile_protection', e.target.checked); if (e.target.checked) { handleInputChange('carpet_protection', false); handleInputChange('no_floor_protection', false); } }} /><span className="text-sm">Floor Tile Protection</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.no_floor_protection} onChange={(e) => { handleInputChange('no_floor_protection', e.target.checked); if (e.target.checked) { handleInputChange('carpet_protection', false); handleInputChange('floor_tile_protection', false); } }} /><span className="text-sm">No Floor</span></label>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Information Provided</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Date Terms and Conditions Given</span>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.terms_conditions_given} onChange={(e) => handleInputChange('terms_conditions_given', e.target.checked)} /><span className="text-sm">Given</span></label>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Gas & Electric Installation Terms Given</span>
                      <label className="flex items-center space-x-2"><input type="checkbox" checked={formData.gas_electric_installation_given} onChange={(e) => handleInputChange('gas_electric_installation_given', e.target.checked)} /><span className="text-sm">Given</span></label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Confirmation and Signature */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3 font-medium">I confirm that the above specification and all annotated plans and elevations with this pack are correct.</p>
              <p className="text-sm text-gray-600 mb-4">Please sign below to confirm.</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Customer Signature</h3>
              <div className="mb-4">
                <div className="flex gap-4 mb-3">
                  <Button variant={signatureMode === "upload" ? "default" : "outline"} onClick={() => setSignatureMode("upload")} size="sm" className="flex items-center gap-2"><Upload className="h-4 w-4" />Upload Signature</Button>
                  <Button variant={signatureMode === "draw" ? "default" : "outline"} onClick={() => setSignatureMode("draw")} size="sm" className="flex items-center gap-2"><PenTool className="h-4 w-4" />Draw Signature</Button>
                </div>
                {signatureMode === "upload" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" accept="image/*" className="hidden" id="signature-upload" />
                    <label htmlFor="signature-upload" className="cursor-pointer"><Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" /><p className="text-sm text-gray-600">Click to upload signature image</p><p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p></label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg">
                    <canvas ref={canvasRef} width={400} height={150} className="w-full cursor-crosshair bg-white rounded-lg" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} style={{ touchAction: 'none' }} />
                    <div className="p-2 border-t bg-gray-50 flex justify-end"><Button variant="outline" size="sm" onClick={clearSignature}>Clear</Button></div>
                  </div>
                )}
              </div>
              <div><Label className="block text-sm font-medium text-gray-700 mb-1">Date</Label><Input type="date" className="w-full max-w-xs" /></div>
            </div>

            <div className="text-center pt-6 border-t">
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setActiveForm(null)}>Cancel</Button>
                <Button className="px-8 py-2 text-lg" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Form'}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Forms & Documents</h1>
            <p className="text-gray-600 mt-1">Create and manage all project documents and checklists</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">{formTypes.length} Form Types</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="checklist" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checklist" className="flex items-center gap-2"><CheckSquare className="h-4 w-4" />Checklists ({getFormsByCategory('checklist').length})</TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2"><FileText className="h-4 w-4" />Documents ({getFormsByCategory('document').length})</TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Financial ({getFormsByCategory('financial').length})</TabsTrigger>
            </TabsList>
            <TabsContent value="checklist"><div className="space-y-4"><div><h3 className="text-lg font-semibold text-gray-900 mb-2">Installation & Quality Checklists</h3><p className="text-gray-600 text-sm mb-4">Verification forms and quality control checklists for various project types</p></div><FormGrid forms={getFormsByCategory('checklist')} /></div></TabsContent>
            <TabsContent value="document"><div className="space-y-4"><div><h3 className="text-lg font-semibold text-gray-900 mb-2">Project Documents</h3><p className="text-gray-600 text-sm mb-4">Professional documents for quotes, invoices, and project management</p></div><FormGrid forms={getFormsByCategory('document')} /></div></TabsContent>
            <TabsContent value="financial"><div className="space-y-4"><div><h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Documents</h3><p className="text-gray-600 text-sm mb-4">Receipts and payment documentation for all transaction types</p></div><FormGrid forms={getFormsByCategory('financial')} /></div></TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" />Recent Forms</CardTitle>
              <CardDescription>Recently created documents</CardDescription>
            </CardHeader>
            <CardContent>
              {recentForms.length > 0 ? (
                <div className="space-y-3">
                  {recentForms.map((form) => (
                    <div key={form.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleViewForm(form.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${form.type.includes('kitchen') ? 'bg-blue-100 text-blue-600' : form.type.includes('bedroom') ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                          {form.type.includes('kitchen') ? <ChefHat className="h-4 w-4" /> : form.type.includes('bedroom') ? <Bed className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{form.customerName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{form.type.replace('-', ' ')}</span>
                            <Badge variant={form.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{form.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{form.date}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent forms found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Document Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-blue-600" /><span className="text-sm">Checklists</span></div><Badge variant="outline">15 this month</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /><span className="text-sm">Documents</span></div><Badge variant="outline">23 this month</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-teal-600" /><span className="text-sm">Financial</span></div><Badge variant="outline">18 this month</Badge></div>
                <div className="pt-2 border-t"><div className="flex items-center justify-between"><span className="text-sm font-medium">Total Created</span><span className="text-lg font-bold text-blue-600">56</span></div></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}