"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

type TrackingData = {
  id?: number;
  OutputID: number;
  Output: string;
  MainActivityName: string;
  SubActivityName: string;
  Sub_Sub_ActivityID_ID?: number;
  Sub_Sub_ActivityName: string;
  UnitName: string;
  PlannedTargets: number;
  AchievedTargets: number;
  ActivityProgress: number;
  ActivityWeightage: number;
  ActivityWeightageProgress?: number;
  PlannedStartDate: string;
  PlannedEndDate: string;
  Remarks: string;
  Links: string;
  Sector_Name: string;
  District: string;
  Tehsil: string;
  Beneficiaries_Male: number;
  Beneficiaries_Female: number;
  Total_Beneficiaries: number;
  Beneficiary_Types: string;
  SubActivityID: number;
  ActivityID: number;
  Sub_Sub_ActivityID: number;
};

type TrackingSheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TrackingData) => Promise<void>;
  data?: TrackingData | null;
  mode: 'add' | 'edit';
};

export default function TrackingSheetModal({ 
  isOpen, 
  onClose, 
  onSave, 
  data, 
  mode 
}: TrackingSheetModalProps) {
  const [formData, setFormData] = useState<TrackingData>({
    OutputID: 0,
    Output: "",
    MainActivityName: "",
    SubActivityName: "",
    Sub_Sub_ActivityName: "",
    UnitName: "",
    PlannedTargets: 0,
    AchievedTargets: 0,
    ActivityProgress: 0,
    ActivityWeightage: 0,
    PlannedStartDate: "",
    PlannedEndDate: "",
    Remarks: "",
    Links: "",
    Sector_Name: "",
    District: "",
    Tehsil: "",
    Beneficiaries_Male: 0,
    Beneficiaries_Female: 0,
    Total_Beneficiaries: 0,
    Beneficiary_Types: "",
    SubActivityID: 0,
    ActivityID: 0,
    Sub_Sub_ActivityID: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [outputs, setOutputs] = useState<Array<{OutputID: number, Output: string}>>([]);
  const [loadingOutputs, setLoadingOutputs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        setFormData({
          ...data,
          PlannedStartDate: data.PlannedStartDate ? data.PlannedStartDate.split('/').reverse().join('-') : "",
          PlannedEndDate: data.PlannedEndDate ? data.PlannedEndDate.split('/').reverse().join('-') : ""
        });
      } else {
        setFormData({
          OutputID: 0,
          Output: "",
          MainActivityName: "",
          SubActivityName: "",
          Sub_Sub_ActivityName: "",
          UnitName: "",
          PlannedTargets: 0,
          AchievedTargets: 0,
          ActivityProgress: 0,
          ActivityWeightage: 0,
          PlannedStartDate: "",
          PlannedEndDate: "",
          Remarks: "",
          Links: "",
          Sector_Name: "",
          District: "",
          Tehsil: "",
          Beneficiaries_Male: 0,
          Beneficiaries_Female: 0,
          Total_Beneficiaries: 0,
          Beneficiary_Types: "",
          SubActivityID: 0,
          ActivityID: 0,
          Sub_Sub_ActivityID: 0
        });
      }
      setError(null);
      setSuccess(false);
      setValidationErrors({});
      setCurrentStep(1);
      
      // Fetch outputs when modal opens
      fetchOutputs();
    }
  }, [isOpen, mode, data]);

  // Fetch outputs from database
  const fetchOutputs = async () => {
    try {
      setLoadingOutputs(true);
      const response = await fetch('/api/tracking-sheet/outputs');
      const data = await response.json();
      
      if (data.success) {
        setOutputs(data.outputs || []);
      } else {
        console.error('Failed to fetch outputs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching outputs:', error);
    } finally {
      setLoadingOutputs(false);
    }
  };

  // Validation function
  const validateForm = (step?: number) => {
    const errors: Record<string, string> = {};
    
    if (!step || step === 1) {
      if (!formData.OutputID || formData.OutputID <= 0) {
        errors.OutputID = "Output ID is required and must be greater than 0";
      }
      if (!formData.MainActivityName.trim()) {
        errors.MainActivityName = "Main Activity Name is required";
      }
      if (!formData.SubActivityName.trim()) {
        errors.SubActivityName = "Sub Activity Name is required";
      }
    }
    
    if (!step || step === 2) {
      if (formData.PlannedTargets < 0) {
        errors.PlannedTargets = "Planned Targets cannot be negative";
      }
      if (formData.AchievedTargets < 0) {
        errors.AchievedTargets = "Achieved Targets cannot be negative";
      }
      if (formData.ActivityProgress < 0 || formData.ActivityProgress > 100) {
        errors.ActivityProgress = "Activity Progress must be between 0 and 100";
      }
      if (formData.ActivityWeightage < 0 || formData.ActivityWeightage > 100) {
        errors.ActivityWeightage = "Activity Weightage must be between 0 and 100";
      }
    }
    
    if (!step || step === 3) {
      if (formData.Beneficiaries_Male < 0) {
        errors.Beneficiaries_Male = "Male beneficiaries cannot be negative";
      }
      if (formData.Beneficiaries_Female < 0) {
        errors.Beneficiaries_Female = "Female beneficiaries cannot be negative";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (validateForm(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle Output ID selection - auto-populate Output field
    if (name === 'OutputID') {
      const selectedOutput = outputs.find(output => output.OutputID === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value),
        Output: selectedOutput ? selectedOutput.Output : ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Calculate total beneficiaries
      const totalBeneficiaries = formData.Beneficiaries_Male + formData.Beneficiaries_Female;
      const dataToSave = {
        ...formData,
        Total_Beneficiaries: totalBeneficiaries
      };

      await onSave(dataToSave);
      setSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get step title
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Information";
      case 2: return "Targets & Progress";
      case 3: return "Location & Beneficiaries";
      case 4: return "Additional Information";
      default: return "";
    }
  };

  // Get step description
  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Enter the basic activity information and identifiers";
      case 2: return "Set targets, progress, and timeline information";
      case 3: return "Specify location details and beneficiary information";
      case 4: return "Add any additional notes, links, or remarks";
      default: return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b4d2b] to-[#0a3d24] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'add' ? 'Add New Tracking Record' : 'Edit Tracking Record'}
              </h2>
              <p className="text-green-100 mt-1">
                {getStepTitle(currentStep)} - Step {currentStep} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep 
                      ? 'bg-white text-[#0b4d2b]' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      i + 1 < currentStep ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-green-100">
              {getStepDescription(currentStep)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center mb-6">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                {mode === 'add' ? 'Record added successfully!' : 'Record updated successfully!'}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output ID *
                    </label>
                    <select
                      name="OutputID"
                      value={formData.OutputID}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.OutputID ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loadingOutputs}
                    >
                      <option value={0}>
                        {loadingOutputs ? 'Loading outputs...' : 'Select Output ID'}
                      </option>
                      {outputs.map((output) => (
                        <option key={output.OutputID} value={output.OutputID}>
                          {output.OutputID} - {output.Output}
                        </option>
                      ))}
                    </select>
                    {validationErrors.OutputID && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.OutputID}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Description
                    </label>
                    <input
                      type="text"
                      name="Output"
                      value={formData.Output}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Output description will appear here when you select an Output ID"
                    />
                    <p className="mt-1 text-xs text-gray-500">This field is automatically populated when you select an Output ID</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Activity Name *
                    </label>
                    <input
                      type="text"
                      name="MainActivityName"
                      value={formData.MainActivityName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.MainActivityName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Main Activity Name"
                    />
                    {validationErrors.MainActivityName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.MainActivityName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Activity Name *
                    </label>
                    <input
                      type="text"
                      name="SubActivityName"
                      value={formData.SubActivityName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.SubActivityName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Sub Activity Name"
                    />
                    {validationErrors.SubActivityName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.SubActivityName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Sub Activity Name
                    </label>
                    <input
                      type="text"
                      name="Sub_Sub_ActivityName"
                      value={formData.Sub_Sub_ActivityName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter Sub-Sub Activity Name (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Name
                    </label>
                    <input
                      type="text"
                      name="UnitName"
                      value={formData.UnitName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter Unit Name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Targets & Progress */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planned Targets
                    </label>
                    <input
                      type="number"
                      name="PlannedTargets"
                      value={formData.PlannedTargets}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.PlannedTargets ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Planned Targets"
                    />
                    {validationErrors.PlannedTargets && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.PlannedTargets}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Achieved Targets
                    </label>
                    <input
                      type="number"
                      name="AchievedTargets"
                      value={formData.AchievedTargets}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.AchievedTargets ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Achieved Targets"
                    />
                    {validationErrors.AchievedTargets && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.AchievedTargets}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Progress (%)
                    </label>
                    <input
                      type="number"
                      name="ActivityProgress"
                      value={formData.ActivityProgress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.ActivityProgress ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Progress Percentage"
                    />
                    {validationErrors.ActivityProgress && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.ActivityProgress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Weightage (%)
                    </label>
                    <input
                      type="number"
                      name="ActivityWeightage"
                      value={formData.ActivityWeightage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.ActivityWeightage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Weightage Percentage"
                    />
                    {validationErrors.ActivityWeightage && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.ActivityWeightage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planned Start Date
                    </label>
                    <input
                      type="date"
                      name="PlannedStartDate"
                      value={formData.PlannedStartDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planned End Date
                    </label>
                    <input
                      type="date"
                      name="PlannedEndDate"
                      value={formData.PlannedEndDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Beneficiaries */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector Name
                    </label>
                    <input
                      type="text"
                      name="Sector_Name"
                      value={formData.Sector_Name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter Sector Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      name="District"
                      value={formData.District}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter District"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tehsil
                    </label>
                    <input
                      type="text"
                      name="Tehsil"
                      value={formData.Tehsil}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter Tehsil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beneficiary Types
                    </label>
                    <input
                      type="text"
                      name="Beneficiary_Types"
                      value={formData.Beneficiary_Types}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                      placeholder="Enter Beneficiary Types"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Male Beneficiaries
                    </label>
                    <input
                      type="number"
                      name="Beneficiaries_Male"
                      value={formData.Beneficiaries_Male}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.Beneficiaries_Male ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Male Beneficiaries"
                    />
                    {validationErrors.Beneficiaries_Male && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.Beneficiaries_Male}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Female Beneficiaries
                    </label>
                    <input
                      type="number"
                      name="Beneficiaries_Female"
                      value={formData.Beneficiaries_Female}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors ${
                        validationErrors.Beneficiaries_Female ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter Female Beneficiaries"
                    />
                    {validationErrors.Beneficiaries_Female && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.Beneficiaries_Female}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Beneficiaries
                    </label>
                    <input
                      type="number"
                      value={formData.Beneficiaries_Male + formData.Beneficiaries_Female}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="mt-1 text-xs text-gray-500">Automatically calculated from male + female beneficiaries</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    name="Remarks"
                    value={formData.Remarks}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors resize-none"
                    placeholder="Enter any additional remarks or notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Links
                  </label>
                  <input
                    type="url"
                    name="Links"
                    value={formData.Links}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none transition-colors"
                    placeholder="Enter any relevant links (e.g., documents, reports)"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0b4d2b] rounded-lg hover:bg-[#0a3d24] transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'add' ? 'Add Record' : 'Update Record'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}